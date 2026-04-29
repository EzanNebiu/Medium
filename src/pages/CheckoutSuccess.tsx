import { CheckCircle, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useCart } from "../hooks/useCart";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const orderId = params.get("order_id");
  const sessionId = params.get("session_id");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container-page py-16 text-center">
      <CheckCircle className="mx-auto h-14 w-14 text-green-600" />
      <h1 className="mt-4 text-3xl font-black">Pagesa u pranua</h1>
      <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
        Faleminderit. Stripe e përfundoi pagesën dhe porosia po përpunohet nga Medium Mobil Shop.
      </p>
      {orderId && <p className="mt-4 text-sm font-bold">Porosia: {orderId}</p>}
      {sessionId && <p className="mt-1 text-xs text-muted-foreground">Stripe session: {sessionId}</p>}
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/orders"><Button><ShoppingBag className="h-4 w-4" /> Shiko porositë</Button></Link>
        <Link to="/products"><Button variant="outline">Vazhdo blerjen</Button></Link>
      </div>
    </div>
  );
}
