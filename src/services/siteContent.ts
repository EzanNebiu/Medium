import { seedProducts } from "../data/seedProducts";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { HomepageContent, SiteDealBanner, SiteService } from "../types/siteContent";

const HOMEPAGE_KEY = "homepage";
const LOCAL_STORAGE_KEY = "medium-mobil-homepage-content";

export const defaultHomepageContent: HomepageContent = {
  heroBadge: "Pro. Beyond.",
  heroTitle: "Telefona",
  heroHighlight: "Premium",
  heroText: "Modele flagship, aksesorë origjinalë dhe porosi e shpejtë përmes WhatsApp në Medium Mobil Shop Prizren.",
  heroProductId: seedProducts[1]?.id ?? "",
  heroAdvertImage: "",
  featuredProductIds: seedProducts.filter((product) => product.is_featured).slice(0, 4).map((product) => product.id),
  newArrivalProductIds: seedProducts.slice(4, 8).map((product) => product.id),
  services: [
    makeService("Shitje telefonash", "Telefona të rinj dhe modele të kërkuara nga Apple, Samsung, Xiaomi dhe më shumë.", "smartphone", 1),
    makeService("Ndërrim ekrani", "Zëvendësim ekrani për modele të ndryshme me kontroll teknik para dorëzimit.", "wrench", 2),
    makeService("Servisim", "Riparim, kontroll teknik dhe ndërrim pjesësh për telefona.", "shield", 3),
    makeService("Aksesorë", "Mbushës, kufje, këllëfë dhe xhama mbrojtës me cilësi të garantuar.", "headphones", 4),
  ],
  dealBanners: [
    makeDeal("Oferta sezonale për telefona", "Modele iPhone dhe Samsung në fokus, me çmime promocionale dhe konfirmim direkt në WhatsApp.", "Pyet për ofertat", "/products", "badge", 1),
    makeDeal("Aksesorë për çdo blerje", "Mbushës, këllëfë, kufje dhe xhama mbrojtës me cilësi të garantuar për përdorim të përditshëm.", "Rezervo aksesorë", "/products?category=Accessories", "plug", 2),
    makeDeal("Servisim dhe dekodim", "Shërbime për telefona, ndërrim ekranesh dhe ndihmë teknike në dyqan në Prizren.", "Kërko servis", "#sherbime", "wrench", 3),
    makeDeal("Black Friday style deals", "Fushata me zbritje të mëdha dhe produkte të zgjedhura, bazuar në stilin e postimeve të dyqanit.", "Shiko çfarë ka sot", "/products?sort=discount", "shopping", 4),
  ],
  specialOfferTitle: "Oferta speciale",
  specialOfferText: "Kombino telefonin me mbushës, këllëf dhe kufje për çmim më të mirë në fund.",
  brandFilters: ["Apple", "Samsung", "Xiaomi", "Google", "OnePlus", "Medium Mobil"],
};

export async function getHomepageContent(): Promise<HomepageContent> {
  const local = readLocalContent();
  if (!isSupabaseConfigured) return local ?? defaultHomepageContent;

  const { data, error } = await supabase
    .from("site_content")
    .select("value")
    .eq("key", HOMEPAGE_KEY)
    .maybeSingle();

  if (error || !data?.value) return local ?? defaultHomepageContent;
  return normalizeHomepageContent(data.value);
}

export async function saveHomepageContent(content: HomepageContent) {
  const normalized = normalizeHomepageContent(content);
  writeLocalContent(normalized);

  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase.from("site_content").upsert({
    key: HOMEPAGE_KEY,
    value: normalized,
    updated_at: new Date().toISOString(),
  });

  return { error };
}

export function makeService(title = "Shërbim i ri", text = "Përshkrimi i shërbimit.", icon: SiteService["icon"] = "wrench", sortOrder = Date.now()): SiteService {
  return {
    id: crypto.randomUUID(),
    title,
    text,
    icon,
    active: true,
    sort_order: sortOrder,
  };
}

export function makeDeal(title = "Ofertë e re", text = "Përshkrimi i ofertës.", cta = "Shiko ofertën", href = "/products", icon: SiteDealBanner["icon"] = "badge", sortOrder = Date.now()): SiteDealBanner {
  return {
    id: crypto.randomUUID(),
    title,
    text,
    cta,
    href,
    icon,
    image_url: "",
    active: true,
    sort_order: sortOrder,
  };
}

function normalizeHomepageContent(value: unknown): HomepageContent {
  const input = isRecord(value) ? value : {};
  const services = Array.isArray(input.services) ? input.services.map(normalizeService).filter(Boolean) as SiteService[] : defaultHomepageContent.services;
  const dealBanners = Array.isArray(input.dealBanners) ? input.dealBanners.map(normalizeDeal).filter(Boolean) as SiteDealBanner[] : defaultHomepageContent.dealBanners;

  return {
    heroBadge: stringValue(input.heroBadge, defaultHomepageContent.heroBadge),
    heroTitle: stringValue(input.heroTitle, defaultHomepageContent.heroTitle),
    heroHighlight: stringValue(input.heroHighlight, defaultHomepageContent.heroHighlight),
    heroText: stringValue(input.heroText, defaultHomepageContent.heroText),
    heroProductId: stringValue(input.heroProductId, defaultHomepageContent.heroProductId),
    heroAdvertImage: stringValue(input.heroAdvertImage, defaultHomepageContent.heroAdvertImage),
    featuredProductIds: stringArray(input.featuredProductIds, defaultHomepageContent.featuredProductIds),
    newArrivalProductIds: stringArray(input.newArrivalProductIds, defaultHomepageContent.newArrivalProductIds),
    services: services.sort((a, b) => a.sort_order - b.sort_order),
    dealBanners: dealBanners.sort((a, b) => a.sort_order - b.sort_order),
    specialOfferTitle: stringValue(input.specialOfferTitle, defaultHomepageContent.specialOfferTitle),
    specialOfferText: stringValue(input.specialOfferText, defaultHomepageContent.specialOfferText),
    brandFilters: stringArray(input.brandFilters, defaultHomepageContent.brandFilters),
  };
}

function normalizeService(value: unknown): SiteService | null {
  if (!isRecord(value)) return null;
  return {
    id: stringValue(value.id, crypto.randomUUID()),
    title: stringValue(value.title, "Shërbim"),
    text: stringValue(value.text, ""),
    icon: iconValue(value.icon, "wrench"),
    active: booleanValue(value.active, true),
    sort_order: numberValue(value.sort_order, Date.now()),
  };
}

function normalizeDeal(value: unknown): SiteDealBanner | null {
  if (!isRecord(value)) return null;
  return {
    id: stringValue(value.id, crypto.randomUUID()),
    title: stringValue(value.title, "Ofertë"),
    text: stringValue(value.text, ""),
    cta: stringValue(value.cta, "Shiko"),
    href: stringValue(value.href, "/products"),
    icon: iconValue(value.icon, "badge"),
    image_url: stringValue(value.image_url, ""),
    active: booleanValue(value.active, true),
    sort_order: numberValue(value.sort_order, Date.now()),
  };
}

function readLocalContent() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizeHomepageContent(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function writeLocalContent(content: HomepageContent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(content));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function stringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function iconValue(value: unknown, fallback: SiteService["icon"]) {
  return typeof value === "string" && ["smartphone", "wrench", "shield", "headphones", "plug", "badge", "shopping"].includes(value)
    ? value as SiteService["icon"]
    : fallback;
}
