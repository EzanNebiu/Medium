import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { CartSummary } from "../components/cart/CartSummary";
import { ProductCard } from "../components/products/ProductCard";
import { Button } from "../components/ui/button";
import { ProductImage } from "../components/ui/ProductImage";
import { seedProducts } from "../data/seedProducts";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../lib/utils";

export default function Cart() {
  const { items, totals, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const suggested = seedProducts.filter((product) => ["Chargers", "Cases", "Earbuds", "Accessories"].includes(product.category)).slice(0, 4);

  if (!items.length) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-3xl font-black">Shporta është bosh</h1>
        <p className="mt-2 text-muted-foreground">Fillo me një telefon flagship ose një aksesor të dobishëm.</p>
        <Link to="/products"><Button className="mt-6">Bli produkte</Button></Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">Shporta</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.selectedColor}-${item.selectedStorage}`} className="grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-[110px_1fr_auto]">
              <ProductImage className="h-28 w-28 rounded-md object-contain p-2" src={item.product.main_image_url} alt={item.product.name} seed={item.product.name} />
              <div>
                <h2 className="font-black">{item.product.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.selectedColor} {item.selectedStorage}</p>
                <p className="mt-2 font-bold">{formatCurrency(item.product.price)}</p>
                <button className="mt-3 text-sm font-bold text-primary">Ruaje për më vonë</button>
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <div className="flex h-10 items-center rounded-md border">
                  <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <CartSummary totals={totals} />
          {!user && <p className="rounded-md border bg-orange-50 p-3 text-sm text-orange-900">Për të porositur duhet të krijosh llogari ose të hysh. Shporta nuk humbet gjatë këtij procesi.</p>}
          <Link to="/checkout"><Button className="w-full">Vazhdo te pagesa</Button></Link>
        </div>
      </div>
      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-black">Aksesorë të sugjeruar</h2>
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">{suggested.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>
    </div>
  );
}
