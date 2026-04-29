import { supabase } from "../lib/supabase";
import type { ImportedPhone } from "../types/phoneSpecs";

export async function fetchPhoneSpecs(query: string): Promise<ImportedPhone> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const { data, error } = await supabase.functions.invoke<ImportedPhone>("fetch-phone-specs", {
    body: { query },
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  if (error) throw new Error(await getFunctionErrorMessage(error));
  return data ?? { matches: [], message: "No phones found." };
}

async function getFunctionErrorMessage(error: unknown) {
  const fallback = error instanceof Error ? error.message : "Edge Function dështoi.";
  const context = typeof error === "object" && error !== null && "context" in error ? (error as { context?: unknown }).context : null;

  if (context instanceof Response) {
    const status = context.status;
    const body = await context.text().catch(() => "");
    try {
      const parsed = JSON.parse(body) as { message?: string; details?: string };
      return [parsed.message, parsed.details].filter(Boolean).join(" ") || `${fallback} (${status})`;
    } catch {
      return body ? `${fallback} (${status}): ${body}` : `${fallback} (${status})`;
    }
  }

  return fallback;
}
