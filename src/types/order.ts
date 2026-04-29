import type { CartItem } from "./cart";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type DeliveryMethod = "delivery" | "pickup";
export type PaymentMethod = "cash" | "electronic-full" | "monthly";

export type CheckoutForm = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  deliveryNotes: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  installmentMonths: "3" | "6" | "12" | "24";
};

export type Order = {
  id: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string;
  address: string;
  delivery_notes?: string | null;
  delivery_method: string;
  pickup_location?: string | null;
  payment_method: string;
  payment_provider?: string | null;
  payment_status?: "unpaid" | "pending" | "paid" | "failed" | "refunded" | null;
  installment_months?: number | null;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_payment_url?: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_cost: number;
  discount: number;
  total: number;
  estimated_delivery_date?: string | null;
  items: CartItem[];
  created_at: string;
};

export type OrderEmailStatus = {
  sent: boolean;
  message: string;
};
