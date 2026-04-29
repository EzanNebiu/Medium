import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ApiObject = Record<string, unknown>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ message: "Metoda nuk lejohet." }, 405);

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!stripeSecretKey || !supabaseUrl || !serviceRoleKey || !anonKey) {
    return json({ message: "Stripe ose Supabase secrets nuk janë konfiguruar." }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ message: "Kërkohet autentikimi." }, 401);

  const body = await req.json().catch(() => ({}));
  const orderId = String(body.orderId ?? "").trim();
  const paymentMethod = String(body.paymentMethod ?? "").trim();
  const origin = sanitizeOrigin(String(body.origin ?? ""));
  if (!orderId || !["electronic-full", "monthly"].includes(paymentMethod)) {
    return json({ message: "Kërkesa për Stripe nuk është e vlefshme." }, 400);
  }

  const { data: order, error: orderError } = await adminClient
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) return json({ message: "Porosia nuk u gjet." }, 404);
  if (String(order.user_id ?? "") !== userData.user.id) {
    const { data: profile } = await adminClient.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
    if (profile?.role !== "admin") return json({ message: "Nuk ke qasje në këtë porosi." }, 403);
  }

  const params = buildStripeParams(order as ApiObject, paymentMethod, origin);
  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const text = await stripeResponse.text();
  const stripeBody = parseJson(text);
  if (!stripeResponse.ok) {
    const stripeError = isObject(stripeBody) && isObject(stripeBody.error) ? stripeBody.error : null;
    const message = stripeError && typeof stripeError.message === "string" ? stripeError.message : text;
    return json({ message: "Stripe Checkout dështoi.", details: message }, 500);
  }

  if (!isObject(stripeBody) || typeof stripeBody.url !== "string" || typeof stripeBody.id !== "string") {
    return json({ message: "Stripe nuk ktheu një session të vlefshëm." }, 500);
  }

  await adminClient.from("orders").update({
    payment_provider: "stripe",
    payment_status: "pending",
    stripe_checkout_session_id: stripeBody.id,
    stripe_payment_url: stripeBody.url,
  }).eq("id", orderId);

  return json({ url: stripeBody.url, sessionId: stripeBody.id });
});

function buildStripeParams(order: ApiObject, paymentMethod: string, origin: string) {
  const params = new URLSearchParams();
  const orderId = String(order.id);
  const total = Number(order.total ?? 0);
  const currency = "eur";
  params.set("success_url", `${origin}/checkout/success?order_id=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/checkout?stripe_cancelled=1`);
  params.set("client_reference_id", orderId);
  params.set("customer_email", String(order.customer_email ?? ""));
  params.set("metadata[order_id]", orderId);
  params.set("metadata[payment_method]", paymentMethod);

  if (paymentMethod === "monthly") {
    const months = Math.max(1, Number(order.installment_months ?? 12));
    const monthlyAmount = Math.max(50, Math.round((total / months) * 100));
    params.set("mode", "subscription");
    params.set("metadata[installment_months]", String(months));
    params.set("line_items[0][price_data][currency]", currency);
    params.set("line_items[0][price_data][recurring][interval]", "month");
    params.set("line_items[0][price_data][product_data][name]", `Porosia ${orderId} - pagesë mujore`);
    params.set("line_items[0][price_data][product_data][description]", `${months} këste mujore për Medium Mobil Shop`);
    params.set("line_items[0][price_data][unit_amount]", String(monthlyAmount));
    params.set("line_items[0][quantity]", "1");
    params.set("subscription_data[metadata][order_id]", orderId);
    params.set("subscription_data[metadata][installment_months]", String(months));
    return params;
  }

  params.set("mode", "payment");
  params.set("payment_intent_data[metadata][order_id]", orderId);
  const items = Array.isArray(order.order_items) ? order.order_items.filter(isObject) : [];
  items.forEach((item, index) => {
    params.set(`line_items[${index}][price_data][currency]`, currency);
    params.set(`line_items[${index}][price_data][product_data][name]`, String(item.product_name ?? "Produkt"));
    params.set(`line_items[${index}][price_data][unit_amount]`, String(Math.max(50, Math.round(Number(item.unit_price ?? 0) * 100))));
    params.set(`line_items[${index}][quantity]`, String(Math.max(1, Number(item.quantity ?? 1))));
  });

  const deliveryCost = Number(order.delivery_cost ?? 0);
  if (deliveryCost > 0) {
    const index = items.length;
    params.set(`line_items[${index}][price_data][currency]`, currency);
    params.set(`line_items[${index}][price_data][product_data][name]`, "Dërgesa");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(Math.round(deliveryCost * 100)));
    params.set(`line_items[${index}][quantity]`, "1");
  }

  return params;
}

function sanitizeOrigin(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.origin;
  } catch {
    // fall through
  }
  return "http://localhost:5173";
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

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
