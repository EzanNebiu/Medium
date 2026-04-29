import { createContext, useContext, useState, type ReactNode } from "react";
import { showToast } from "../components/ui/toast";
import { toggleWishlist } from "../services/wishlist";
import type { Product } from "../types/product";
import { useAuth } from "./useAuth";

type WishlistContextValue = {
  wishlist: Product[];
  toggle: (product: Product) => Promise<void>;
  isSaved: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const toggle = async (product: Product) => {
    if (!user) {
      showToast("Hyr në llogari për të ruajtur produkte në listën e dëshirave", "error");
      return;
    }
    await toggleWishlist(product.id, user.id);
    setWishlist((current) => (current.some((item) => item.id === product.id) ? current.filter((item) => item.id !== product.id) : [...current, product]));
    showToast("Lista e dëshirave u përditësua");
  };

  const isSaved = (productId: string) => wishlist.some((item) => item.id === productId);

  return <WishlistContext.Provider value={{ wishlist, toggle, isSaved }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
