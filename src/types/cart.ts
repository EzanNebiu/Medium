import type { Product } from "./product";

export type CartItem = {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
};

export type CartTotals = {
  subtotal: number;
  deliveryCost: number;
  discount: number;
  total: number;
};
