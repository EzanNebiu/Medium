import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ApiObject = Record<string, unknown>;

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response("Webhook secrets are not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature") ?? "";
  const payload = await req.text();
  const verified = await verifyStripeSignature(payload, signature, webhookSecret);
  if (!verified) return new Response("Invalid Stripe signature", { status: 400 });

  const event = JSON.parse(payload) as ApiObject;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  if (event.type === "checkout.session.completed") {
    const session = getStripeSession(event);
    if (isObject(session)) {
      await adminClient.from("orders").update({
        payment_provider: "stripe",
        payment_status: "paid",
        status: "confirmed",
        stripe_payment_intent_id: nullableString(session.payment_intent),
        stripe_subscription_id: nullableString(session.subscription),
        stripe_customer_id: nullableString(session.customer),
        updated_at: new Date().toISOString(),
      }).eq("stripe_checkout_session_id", String(session.id));

      const installmentMonths = getMetadataNumber(session, "installment_months");
      const subscriptionId = nullableString(session.subscription);
      if (stripeSecretKey && subscriptionId && installmentMonths > 0) {
        await scheduleSubscriptionCancellation(stripeSecretKey, subscriptionId, installmentMonths);
      }
    }
  }

  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const session = getStripeSession(event);
    if (isObject(session)) {
      await adminClient.from("orders").update({
        payment_status: "failed",
        updated_at: new Date().toISOString(),
      }).eq("stripe_checkout_session_id", String(session.id));
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function verifyStripeSignature(payload: string, signature: string, secret: string) {
  const parts = Object.fromEntries(signature.split(",").map((part) => {
    const [key, value] = part.split("=");
    return [key, value];
  }));
  if (!parts.t || !parts.v1) return false;

  const signedPayload = `${parts.t}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  return constantTimeEqual(toHex(digest), parts.v1);
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function getStripeSession(event: ApiObject) {
  const data = isObject(event.data) ? event.data : null;
  return data?.object ?? null;
}

function getMetadataNumber(source: ApiObject, key: string) {
  const metadata = isObject(source.metadata) ? source.metadata : null;
  return Number(metadata?.[key] ?? 0);
}

async function scheduleSubscriptionCancellation(stripeSecretKey: string, subscriptionId: string, months: number) {
  const cancelAt = Math.floor(Date.now() / 1000) + months * 30 * 24 * 60 * 60;
  const params = new URLSearchParams();
  params.set("cancel_at", String(cancelAt));
  await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
}

function isObject(value: unknown): value is ApiObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
