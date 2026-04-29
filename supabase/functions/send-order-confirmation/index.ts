import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  warranty_months: number | null;
  delivery_estimate: string | null;
};

type OrderRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  delivery_method: string | null;
  pickup_location: string | null;
  payment_method: string;
  installment_months: number | null;
  status: string;
  subtotal: number;
  delivery_cost: number;
  discount: number;
  total: number;
  estimated_delivery_date: string | null;
  order_items: OrderItem[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ sent: false, message: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom = Deno.env.get("ORDER_EMAIL_FROM") ?? "Medium Mobil Shop <orders@mediummobil.local>";

  if (!supabaseUrl || !serviceRoleKey) return json({ sent: false, message: "Supabase Edge Function secrets are missing." }, 500);
  if (!resendApiKey) return json({ sent: false, message: "RESEND_API_KEY is not configured." }, 200);

  const body = await req.json().catch(() => ({}));
  const orderId = String(body.orderId ?? "").trim();
  if (!orderId) return json({ sent: false, message: "orderId is required." }, 400);

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email, delivery_method, pickup_location, payment_method, installment_months, status, subtotal, delivery_cost, discount, total, estimated_delivery_date, order_items(product_name, quantity, unit_price, total_price, warranty_months, delivery_estimate)")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return json({ sent: false, message: "Order was not found." }, 404);

  const order = normalizeOrder(data as unknown as OrderRow);
  if (!order.customer_email) return json({ sent: false, message: "Order has no customer email." }, 400);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [order.customer_email],
      subject: `Konfirmimi i porosisë Medium Mobil Shop ${shortId(order.id)}`,
      html: renderEmail(order),
      text: renderTextEmail(order),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    return json({ sent: false, message: `Email provider error: ${message}` }, 200);
  }

  return json({ sent: true, message: "Order confirmation email sent." });
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeOrder(order: OrderRow): OrderRow {
  return {
    ...order,
    subtotal: Number(order.subtotal ?? 0),
    delivery_cost: Number(order.delivery_cost ?? 0),
    discount: Number(order.discount ?? 0),
    total: Number(order.total ?? 0),
    installment_months: order.installment_months === null ? null : Number(order.installment_months),
    order_items: (order.order_items ?? []).map((item) => ({
      ...item,
      quantity: Number(item.quantity ?? 0),
      unit_price: Number(item.unit_price ?? 0),
      total_price: Number(item.total_price ?? 0),
      warranty_months: item.warranty_months === null ? null : Number(item.warranty_months),
    })),
  };
}

function renderEmail(order: OrderRow) {
  const items = order.order_items
    .map((item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #fed7aa;">
          <strong>${escapeHtml(item.product_name)}</strong><br />
          <span style="color:#57534e;">Sasia ${item.quantity} · Garanci ${item.warranty_months ?? 0} muaj · ${deliveryLabel(item.delivery_estimate ?? "Standard delivery")}</span>
        </td>
        <td style="padding:12px;border-bottom:1px solid #fed7aa;text-align:right;">${money(item.total_price)}</td>
      </tr>
    `)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;background:#fff7ed;padding:28px;color:#111827;">
      <div style="max-width:680px;margin:auto;background:white;border:1px solid #fed7aa;border-radius:14px;overflow:hidden;">
        <div style="background:#111827;color:white;padding:24px;">
          <h1 style="margin:0;font-size:26px;">Medium <span style="color:#f97316;">Mobil Shop</span></h1>
          <p style="margin:8px 0 0;">Konfirmimi i porosisë ${shortId(order.id)}</p>
        </div>
        <div style="padding:24px;">
          <p>Përshëndetje ${escapeHtml(order.customer_name || "klient")},</p>
          <p>Faleminderit për porosinë. Mënyra e pagesës është <strong>${paymentLabel(order)}</strong> dhe statusi i porosisë është <strong>${statusLabel(order.status)}</strong>.</p>
          <p><strong>Marrja:</strong> ${deliveryMethodLabel(order.delivery_method ?? "delivery")}${order.pickup_location ? ` · ${escapeHtml(order.pickup_location)}` : ""}</p>
          <p><strong>Data e vlerësuar:</strong> ${formatDate(order.estimated_delivery_date)}</p>
          <table style="width:100%;border-collapse:collapse;margin-top:18px;">${items}</table>
          <div style="margin-top:18px;border-top:1px solid #fed7aa;padding-top:16px;">
            <p style="display:flex;justify-content:space-between;margin:6px 0;"><span>Nëntotali</span><strong>${money(order.subtotal)}</strong></p>
            <p style="display:flex;justify-content:space-between;margin:6px 0;"><span>Dërgesa</span><strong>${order.delivery_cost ? money(order.delivery_cost) : "Falas"}</strong></p>
            <p style="display:flex;justify-content:space-between;margin:6px 0;color:#166534;"><span>Zbritja</span><strong>-${money(order.discount)}</strong></p>
            <p style="display:flex;justify-content:space-between;margin:12px 0 0;font-size:20px;"><span>${order.payment_method === "monthly" ? "Totali i planit mujor" : "Totali i paguar / për pagesë"}</span><strong>${money(order.total)}</strong></p>
            ${order.payment_method === "monthly" && order.installment_months ? `<p style="margin:8px 0 0;color:#57534e;">Pagesa mujore: ${money(order.total / order.installment_months)} në muaj për ${order.installment_months} muaj.</p>` : ""}
          </div>
          <p style="margin-top:22px;color:#57534e;">Garancia është e shënuar për secilin produkt më sipër. Ruaje këtë email si referencë për porosinë dhe garancinë.</p>
        </div>
      </div>
    </div>
  `;
}

function renderTextEmail(order: OrderRow) {
  const itemLines = order.order_items.map((item) => `- ${item.quantity} x ${item.product_name}: ${money(item.total_price)} | garanci ${item.warranty_months ?? 0} muaj | ${deliveryLabel(item.delivery_estimate ?? "Standard delivery")}`);
  return [
    `Konfirmimi i porosisë Medium Mobil Shop ${shortId(order.id)}`,
    `Mënyra e pagesës: ${paymentLabel(order)}`,
    `Marrja: ${deliveryMethodLabel(order.delivery_method ?? "delivery")}${order.pickup_location ? ` - ${order.pickup_location}` : ""}`,
    `Statusi: ${statusLabel(order.status)}`,
    `Data e vlerësuar: ${formatDate(order.estimated_delivery_date)}`,
    "",
    ...itemLines,
    "",
    `Nëntotali: ${money(order.subtotal)}`,
    `Dërgesa: ${order.delivery_cost ? money(order.delivery_cost) : "Falas"}`,
    `Zbritja: -${money(order.discount)}`,
    `${order.payment_method === "monthly" ? "Totali i planit mujor" : "Totali i paguar / për pagesë"}: ${money(order.total)}`,
    order.payment_method === "monthly" && order.installment_months ? `Pagesa mujore: ${money(order.total / order.installment_months)} në muaj për ${order.installment_months} muaj` : "",
    "Ruaje këtë email si referencë për porosinë dhe garancinë.",
  ].filter(Boolean).join("\n");
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function money(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Për t'u konfirmuar";
  return new Intl.DateTimeFormat("sq-AL", { dateStyle: "full" }).format(new Date(value));
}

function paymentLabel(order: Pick<OrderRow, "payment_method" | "installment_months" | "total">) {
  if (order.payment_method === "cash") return "Pagesë me para në dorë";
  if (order.payment_method === "electronic-full" || order.payment_method === "bank" || order.payment_method === "card") return "Pagesë elektronike e plotë";
  if (order.payment_method === "monthly") {
    const months = order.installment_months ?? 12;
    return `Pagesë mujore (${months} muaj, ${money(order.total / months)}/muaj)`;
  }
  return escapeHtml(order.payment_method);
}

function deliveryMethodLabel(value: string) {
  if (value === "pickup") return "Marrje në dyqan";
  if (value === "delivery") return "Dërgesë në adresë";
  return escapeHtml(value);
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    pending: "në pritje",
    confirmed: "konfirmuar",
    processing: "duke u përgatitur",
    shipped: "dërguar",
    delivered: "dorëzuar",
    cancelled: "anuluar",
  };
  return labels[value] ?? escapeHtml(value);
}

function deliveryLabel(value: string) {
  if (value === "24h delivery") return "Dërgesë 24h";
  if (value === "Fast delivery") return "Dërgesë e shpejtë";
  if (value === "Pre-order") return "Porosi paraprake";
  if (value === "Standard delivery") return "Dërgesë standarde";
  return escapeHtml(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
