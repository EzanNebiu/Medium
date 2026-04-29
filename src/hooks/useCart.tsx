import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { showToast } from "../components/ui/toast";
import { calculateCartTotals } from "../services/cart";
import type { CartItem } from "../types/cart";
import type { Product } from "../types/product";

type CartContextValue = {
  items: CartItem[];
  totals: ReturnType<typeof calculateCartTotals>;
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedStorage?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "medium-mobil-shop-cart";
const LEGACY_CART_STORAGE_KEY = ["mobile", "zone-cart"].join("");

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY) ?? localStorage.getItem(LEGACY_CART_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  }, [items]);

  const addToCart = (product: Product, quantity = 1, selectedColor?: string, selectedStorage?: string) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.selectedColor === selectedColor && item.selectedStorage === selectedStorage);
      if (existing) {
        return current.map((item) => (item === existing ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...current, { product, quantity, selectedColor, selectedStorage }];
    });
    showToast(`${product.name} u shtua në shportë`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((current) => current.map((item) => (item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item)));
  };

  const removeFromCart = (productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setItems([]);
  const totals = useMemo(() => calculateCartTotals(items), [items]);

  return <CartContext.Provider value={{ items, totals, addToCart, updateQuantity, removeFromCart, clearCart }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
