import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { CartItem } from "../types/cart";
import type { CheckoutForm, OrderStatus } from "../types/order";
import { calculateCartTotals } from "./cart";
import { saveCheckoutProfile } from "./profile";

export async function createOrder(form: CheckoutForm, items: CartItem[], userId?: string) {
  const totals = calculateCartTotals(items, form.deliveryMethod);
  const estimatedDeliveryDate = getEstimatedDeliveryDate(items, form.deliveryMethod);
  if (!isSupabaseConfigured) {
    return { orderId: `MMS-${Date.now()}`, estimatedDeliveryDate, emailSent: false, error: null };
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId ?? null,
      customer_name: form.fullName,
      customer_email: form.email,
      customer_phone: form.phone,
      city: form.city,
      address: form.address,
      delivery_notes: form.deliveryNotes,
      delivery_method: form.deliveryMethod,
      pickup_location: form.deliveryMethod === "pickup" ? "Medium Mobil Shop, Prishtinë" : null,
      payment_method: form.paymentMethod,
      payment_provider: form.paymentMethod === "cash" ? null : "stripe",
      payment_status: form.paymentMethod === "cash" ? "unpaid" : "pending",
      installment_months: form.paymentMethod === "monthly" ? Number(form.installmentMonths) : null,
      subtotal: totals.subtotal,
      delivery_cost: totals.deliveryCost,
      discount: totals.discount,
      total: totals.total,
      estimated_delivery_date: estimatedDeliveryDate,
    })
    .select()
    .single();

  if (error) return { orderId: null, error };
  if (userId) await saveCheckoutProfile(userId, form);

  const orderItems = items.map((item) => ({
    order_id: data.id,
    product_id: item.product.id.startsWith("demo-") ? null : item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.price,
    total_price: item.product.price * item.quantity,
    warranty_months: item.product.warranty_months,
    delivery_estimate: item.product.delivery_badge,
  }));
  await supabase.from("order_items").insert(orderItems);
  const email = await sendOrderConfirmationEmail(data.id as string, "placed");
  return { orderId: data.id as string, estimatedDeliveryDate, emailSent: email.sent, error: null };
}

export async function sendOrderConfirmationEmail(orderId: string, emailType: "placed" | "paid" | "shipped" = "placed") {
  if (!isSupabaseConfigured) return { sent: false, message: "Supabase is not configured." };
  const { data, error } = await supabase.functions.invoke<{ sent: boolean; message: string }>("send-order-confirmation", {
    body: { orderId, emailType },
  });
  if (error) return { sent: false, message: error.message };
  return data ?? { sent: false, message: "No email response returned." };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!isSupabaseConfigured) return { error: null, emailSent: false };
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) return { error, emailSent: false };

  if (status === "shipped") {
    const email = await sendOrderConfirmationEmail(orderId, "shipped");
    return { error: null, emailSent: email.sent };
  }
  return { error: null, emailSent: false };
}

export async function getOrders(userId?: string) {
  if (!isSupabaseConfigured || !userId) return [];
  const { data } = await supabase.from("orders").select("*, order_items(*)").eq("user_id", userId).order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminOrders() {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
  return data ?? [];
}

function getEstimatedDeliveryDate(items: CartItem[], deliveryMethod: CheckoutForm["deliveryMethod"]) {
  if (deliveryMethod === "pickup") {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }
  const maxDays = items.some((item) => item.product.delivery_badge.toLowerCase().includes("pre-order"))
    ? 10
    : items.some((item) => item.product.delivery_badge.toLowerCase().includes("24h"))
      ? 1
      : 3;
  const date = new Date();
  date.setDate(date.getDate() + maxDays);
  return date.toISOString().slice(0, 10);
}
