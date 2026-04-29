import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ApiObject = Record<string, unknown>;

const RAPIDAPI_HOST = "mobile-phone-specs-database.p.rapidapi.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const knownBrands = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Redmi",
  "Google",
  "OnePlus",
  "Huawei",
  "Honor",
  "Oppo",
  "Vivo",
  "Realme",
  "Motorola",
  "Nokia",
  "Sony",
  "Nothing",
  "Asus",
  "ZTE",
  "Lenovo",
  "Tecno",
  "Infinix",
];

const knownPhoneCatalog = [
  {
    brand: "Samsung",
    name: "Galaxy S22 Ultra 5G",
    customId: "103693",
    year: "2022",
    aliases: ["samsung s22 ultra", "samsung galaxy s22 ultra", "galaxy s22 ultra", "s22 ultra"],
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ message: "Metoda nuk lejohet." }, 405);

  const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!rapidApiKey || !supabaseUrl || !serviceRoleKey || !anonKey) {
    return json({ message: "Sekretet e Edge Function nuk janë konfiguruar." }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ message: "Kërkohet autentikimi." }, 401);

  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
  if (profile?.role !== "admin") return json({ message: "Kërkohet roli administrator." }, 403);

  const body = await req.json().catch(() => ({}));
  const query = String(body.query ?? "").trim();
  if (!query) return json({ message: "Kërkimi është i detyrueshëm." }, 400);

  try {
    const matches = await searchPhones(query, rapidApiKey);
    await logImport(adminClient, userData.user.id, query, matches[0]?.name ?? null, matches.length ? "success" : "empty", null);
    return json({ matches, message: matches.length ? undefined : "Nuk u gjet asnjë telefon." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import error";
    await logImport(adminClient, userData.user.id, query, null, "failed", message);
    const status = isQuotaError(message) ? 429 : 500;
    return json({ message: "Importimi i telefonit dështoi.", details: cleanRapidApiError(message) }, status);
  }
});

async function searchPhones(query: string, rapidApiKey: string) {
  const customId = query.match(/\b\d{4,}\b/)?.[0];
  if (customId) {
    const details = await getSpecificationsByCustomId(customId, rapidApiKey);
    return [await normalizeDevice(details, rapidApiKey)];
  }

  const localMatches = searchKnownPhones(query);
  if (localMatches.length) {
    return localMatches.map(candidateToMatch);
  }

  const brand = inferBrand(query);
  if (!brand) {
    return [];
  }

  const model = query.replace(new RegExp(`^${escapeRegExp(brand)}\\s+`, "i"), "").trim();
  const modelList = await getModelsByBrand(brand, rapidApiKey);
  const candidates = modelList
    .map((item) => normalizeModelCandidate(item, brand))
    .filter((item) => item.name)
    .map((item) => ({ ...item, score: scoreMatch(`${item.brand} ${item.name}`, `${brand} ${model || query}`) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return candidates.map(candidateToMatch);
}

async function getSpecificationsByCustomId(customId: string, rapidApiKey: string) {
  const raw = await rapidApiGet(`/gsm/get-specifications-by-phone-custom-id/${encodeURIComponent(customId)}`, rapidApiKey);
  return asObject(raw);
}

async function getModelsByBrand(brand: string, rapidApiKey: string) {
  const raw = await tryRapidApiPaths([
    `/gsm/list-all-models-by-phone-brand/${encodeURIComponent(brand)}`,
    `/gsm/get-models-by-phone-brand/${encodeURIComponent(brand)}`,
    `/gsm/get-models-by-brand/${encodeURIComponent(brand)}`,
    `/gsm/get-models-by-brandname/${encodeURIComponent(brand)}`,
    `/gsm/get-phone-models-by-brand/${encodeURIComponent(brand)}`,
    `/gsm/get-phone-models-by-brandname/${encodeURIComponent(brand)}`,
  ], rapidApiKey);
  return extractObjects(raw);
}

async function getPhoneImage(customId: string, rapidApiKey: string) {
  const raw = await rapidApiGet(`/gsm/get-phone-image-link-by-phone-custom-id/${encodeURIComponent(customId)}`, rapidApiKey);
  return extractImages(raw)[0] ?? "";
}

async function tryRapidApiPaths(paths: string[], rapidApiKey: string) {
  const errors: string[] = [];
  for (const path of paths) {
    try {
      return await rapidApiGet(path, rapidApiKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isQuotaError(message)) throw new Error(cleanRapidApiError(message));
      errors.push(`${path}: ${message}`);
      if (!/does not exist|not found|404/i.test(message)) break;
    }
  }
  throw new Error(cleanRapidApiError(errors.join(" | ")));
}

async function rapidApiGet(path: string, rapidApiKey: string) {
  const response = await fetch(`https://${RAPIDAPI_HOST}${path}`, {
    headers: {
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": RAPIDAPI_HOST,
      "Content-Type": "application/json",
    },
  });
  const text = await response.text();
  const body = parseJson(text);
  if (!response.ok) {
    const message = isObject(body) && typeof body.message === "string" ? body.message : text;
    throw new Error(cleanRapidApiError(message || `RapidAPI returned ${response.status}`));
  }
  return body;
}

function cleanRapidApiError(message: string) {
  if (isQuotaError(message)) {
    return "Kuota mujore e RapidAPI është tejkaluar për planin aktual. Ndrysho planin, përdor një RapidAPI key tjetër, ose prit resetimin e kuotës.";
  }
  return message.replace(/\s+/g, " ").trim();
}

function isQuotaError(message: string) {
  return /quota|exceeded|monthly|too many requests|429/i.test(message);
}

async function normalizeDevice(raw: ApiObject, rapidApiKey: string, fallback?: { brand: string; name: string; customId?: string }) {
  const phoneDetails = asObject(raw.phoneDetails);
  const customId = String(phoneDetails.customId ?? raw.customId ?? fallback?.customId ?? "");
  const brand = String(phoneDetails.brandValue ?? raw.brandValue ?? fallback?.brand ?? "Unknown");
  const name = String(phoneDetails.modelValue ?? raw.modelValue ?? fallback?.name ?? "Unknown phone");
  const images = uniqueImages(extractImages(raw));
  if (customId && !images.length) {
    const image = await getPhoneImage(customId, rapidApiKey).catch(() => "");
    if (image) images.push(image);
  }

  const specs = {
    display: joinParts(
      pickNested(raw, "gsmDisplayDetails.displayType"),
      pickNested(raw, "gsmDisplayDetails.displaySize"),
      pickNested(raw, "gsmDisplayDetails.displayResolution"),
      pickNested(raw, "gsmDisplayDetails.displayProtection"),
    ),
    processor: joinParts(
      pickNested(raw, "gsmPlatformDetails.platformChipset"),
      pickNested(raw, "gsmPlatformDetails.platformCpu"),
    ),
    ram: extractRam(String(pickNested(raw, "gsmMemoryDetails.memoryInternal") ?? "")),
    storage: String(pickNested(raw, "gsmMemoryDetails.memoryInternal") ?? ""),
    rear_camera: joinParts(
      pickNested(raw, "gsmMainCameraDetails.mainCameraSingle"),
      pickNested(raw, "gsmMainCameraDetails.mainCameraDual"),
      pickNested(raw, "gsmMainCameraDetails.mainCameraTriple"),
      pickNested(raw, "gsmMainCameraDetails.mainCameraQuad"),
      pickNested(raw, "gsmMainCameraDetails.mainCameraVideo"),
    ),
    front_camera: joinParts(
      pickNested(raw, "gsmSelfieCameraDetails.selfieCameraSingle"),
      pickNested(raw, "gsmSelfieCameraDetails.selfieCameraDual"),
      pickNested(raw, "gsmSelfieCameraDetails.selfieCameraVideo"),
    ),
    battery: String(pickNested(raw, "gsmBatteryDetails.batteryType") ?? ""),
    charging: String(pickNested(raw, "gsmBatteryDetails.batteryCharging") ?? ""),
    operating_system: String(pickNested(raw, "gsmPlatformDetails.platformOs") ?? ""),
    network: joinParts(
      pickNested(raw, "gsmNetworkDetails.networkTechnology"),
      pickNested(raw, "gsmNetworkDetails.network5GBands"),
    ),
    sim: String(pickNested(raw, "gsmBodyDetails.bodySim") ?? ""),
    dimensions: String(pickNested(raw, "gsmBodyDetails.bodyDimensions") ?? ""),
    weight: String(pickNested(raw, "gsmBodyDetails.bodyWeight") ?? ""),
    colors: String(pickNested(raw, "gsmMiscDetails.miscColors") ?? ""),
    release_date: joinParts(
      phoneDetails.yearValue,
      pickNested(raw, "gsmLaunchDetails.launchAnnounced"),
      pickNested(raw, "gsmLaunchDetails.launchStatus"),
    ),
    full_specs: raw,
  };

  return {
    deviceId: customId || `${brand}-${name}`,
    name,
    brand,
    releaseYear: String(phoneDetails.yearValue ?? specs.release_date),
    thumbnail: images[0] ?? "",
    images,
    specs,
    raw,
  };
}

function candidateToMatch(candidate: { brand: string; name: string; customId?: string; year?: string }) {
  return {
    deviceId: candidate.customId ?? `${candidate.brand}-${candidate.name}`,
    name: candidate.name,
    brand: candidate.brand,
    releaseYear: candidate.year ?? "",
    thumbnail: "",
    images: [],
    specs: undefined,
    raw: candidate,
  };
}

function normalizeModelCandidate(item: ApiObject, fallbackBrand: string) {
  const details = asObject(item.phoneDetails);
  const customId = String(item.customId ?? item.phoneCustomId ?? item.id ?? item.custom_id ?? details.customId ?? "");
  const brand = String(item.brandValue ?? item.brand ?? details.brandValue ?? fallbackBrand);
  const name = String(item.modelValue ?? item.modelName ?? item.model ?? item.name ?? item.title ?? details.modelValue ?? "");
  const year = String(item.yearValue ?? item.year ?? details.yearValue ?? "");
  return { customId, brand, name, year };
}

function searchKnownPhones(query: string) {
  const normalizedQuery = normalizeSearchText(query);
  return knownPhoneCatalog
    .map((phone) => ({
      ...phone,
      score: Math.max(
        scoreSearchText(normalizeSearchText(`${phone.brand} ${phone.name}`), normalizedQuery),
        ...phone.aliases.map((alias) => scoreSearchText(normalizeSearchText(alias), normalizedQuery)),
      ),
    }))
    .filter((phone) => phone.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ score: _score, aliases: _aliases, ...phone }) => phone);
}

function extractObjects(raw: unknown): ApiObject[] {
  if (Array.isArray(raw)) return raw.filter(isObject);
  if (!isObject(raw)) return [];
  const object = raw as ApiObject;
  for (const value of Object.values(object)) {
    if (Array.isArray(value) && value.some(isObject)) return value.filter(isObject);
  }
  return Object.values(object).flatMap((value) => Array.isArray(value) ? value.filter(isObject) : []);
}

function extractImages(value: unknown): string[] {
  const images: string[] = [];
  const visit = (node: unknown) => {
    if (!node) return;
    if (typeof node === "string") {
      const normalized = normalizeImageUrl(node);
      if (normalized) images.push(normalized);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node === "object") {
      for (const [key, child] of Object.entries(node as ApiObject)) {
        if (/image|images|img|picture|pictures|photo|photos|thumbnail|thumb|poster|link/i.test(key)) visit(child);
        else if (typeof child === "object" && child !== null) visit(child);
      }
    }
  };
  visit(value);
  return uniqueImages(images);
}

function normalizeImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
  if (/\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(trimmed)) {
    return trimmed.startsWith("/") ? `https://fdn2.gsmarena.com${trimmed}` : trimmed;
  }
  return "";
}

function inferBrand(query: string) {
  const normalized = query.toLowerCase();
  return knownBrands.find((brand) => normalized.startsWith(brand.toLowerCase()) || normalized.includes(` ${brand.toLowerCase()} `)) ?? "";
}

function scoreMatch(candidate: string, query: string) {
  const words = query.toLowerCase().split(/\s+/).filter((word) => word.length > 1);
  const haystack = candidate.toLowerCase();
  return words.filter((word) => haystack.includes(word)).length;
}

function scoreSearchText(candidate: string, query: string) {
  const queryWords = query.split(" ").filter((word) => word.length > 1);
  if (!queryWords.length) return 0;
  const matched = queryWords.filter((word) => candidate.includes(word)).length;
  return matched === queryWords.length || candidate.includes(query) ? matched + 10 : matched;
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function pickNested(source: ApiObject, path: string) {
  return path.split(".").reduce<unknown>((current, key) => isObject(current) ? current[key] : undefined, source);
}

function joinParts(...values: unknown[]) {
  return values.map((value) => String(value ?? "").trim()).filter(Boolean).join("\n");
}

function extractRam(memory: string) {
  const matches = memory.match(/\d+GB\s+RAM/gi);
  return matches ? Array.from(new Set(matches)).join(", ") : "";
}

function uniqueImages(images: string[]) {
  return Array.from(new Set(images.filter(Boolean)));
}

function parseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function isObject(value: unknown): value is ApiObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asObject(value: unknown): ApiObject {
  return isObject(value) ? value : {};
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function logImport(client: ReturnType<typeof createClient>, userId: string, query: string, selected: string | null, status: string, error: string | null) {
  await client.from("api_import_logs").insert({
    admin_user_id: userId,
    search_query: query,
    selected_device: selected,
    status,
    error_message: error,
  });
}
