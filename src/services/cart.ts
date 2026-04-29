import type { CartItem, CartTotals } from "../types/cart";
import type { DeliveryMethod } from "../types/order";

export function calculateCartTotals(items: CartItem[], deliveryMethod: DeliveryMethod = "delivery"): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCost = deliveryMethod === "pickup" || subtotal > 250 || subtotal === 0 ? 0 : 3.5;
  const discount = items.reduce((sum, item) => {
    const oldPrice = item.product.old_price ?? item.product.price;
    return sum + Math.max(0, oldPrice - item.product.price) * item.quantity;
  }, 0);
  return { subtotal, deliveryCost, discount, total: subtotal + deliveryCost };
}
