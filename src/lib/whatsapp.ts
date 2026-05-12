import type { CartItem } from "../types/cart";
import type { CheckoutForm } from "../types/order";
import { calculateCartTotals } from "../services/cart";
import { formatCurrency } from "./utils";
import { sqDeliveryMethod, sqPayment } from "./albanian";

export const WHATSAPP_PHONE_NUMBER = "38349684500";
export const WHATSAPP_DISPLAY_NUMBER = "+383 49 684 500";

export function whatsappUrl(message: string, phoneNumber?: string) {
  const phone = phoneNumber || WHATSAPP_PHONE_NUMBER;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function storeWhatsAppUrl(message = "Përshëndetje, dua më shumë informata për ofertat e Medium Mobil Shop.", phoneNumber?: string) {
  return whatsappUrl(message, phoneNumber);
}

export function buildOrderWhatsAppMessage(
  orderId: string,
  form: CheckoutForm,
  items: CartItem[],
  estimatedDeliveryDate?: string | null,
) {
  const totals = calculateCartTotals(items, form.deliveryMethod);
  const lines = [
    "Përshëndetje Medium Mobil Shop, dua ta konfirmoj këtë porosi:",
    "",
    `Porosia: ${orderId}`,
    `Emri: ${form.fullName}`,
    `Telefoni: ${form.phone}`,
    `Email: ${form.email}`,
    `Marrja: ${sqDeliveryMethod(form.deliveryMethod)}`,
    form.deliveryMethod === "delivery" ? `Adresa: ${form.city}, ${form.address}` : "Marrje në dyqan: Prizren",
    form.deliveryNotes ? `Shënime: ${form.deliveryNotes}` : "",
    `Pagesa: ${sqPayment(form.paymentMethod)}${form.paymentMethod === "monthly" ? ` (${form.installmentMonths} muaj)` : ""}`,
    estimatedDeliveryDate ? `Data e vlerësuar: ${new Date(estimatedDeliveryDate).toLocaleDateString("sq-AL")}` : "",
    "",
    "Produktet:",
    ...items.map((item) => `- ${item.quantity} x ${item.product.name} (${formatCurrency(item.product.price)})`),
    "",
    `Totali: ${formatCurrency(totals.total)}`,
  ];

  return lines.filter(Boolean).join("\n");
}
