import { supabase } from "../lib/supabase";
import type { PaymentMethod } from "../types/order";

type StripeCheckoutResponse = {
  url?: string;
  sessionId?: string;
  message?: string;
};

type StripeCheckoutSession = {
  url: string;
  sessionId?: string;
};

export async function createStripeCheckoutSession(orderId: string, paymentMethod: PaymentMethod, origin: string): Promise<StripeCheckoutSession> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const { data, error } = await supabase.functions.invoke<StripeCheckoutResponse>("create-stripe-checkout", {
    body: { orderId, paymentMethod, origin },
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  if (error) throw new Error(await getFunctionErrorMessage(error));
  if (!data?.url) throw new Error(data?.message ?? "Stripe nuk ktheu linkun e pagesës.");
  return { url: data.url, sessionId: data.sessionId };
}

async function getFunctionErrorMessage(error: unknown) {
  const fallback = error instanceof Error ? error.message : "Stripe checkout dështoi.";
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
