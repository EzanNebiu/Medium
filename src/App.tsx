import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { WishlistProvider } from "./hooks/useWishlist";
import { ToastHost } from "./components/ui/toast";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppRoutes />
          <ToastHost />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
