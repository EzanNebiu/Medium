import { CircleDollarSign, Package, ShoppingBag, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { seedProducts } from "../../data/seedProducts";
import { formatCurrency } from "../../lib/utils";
import { getAdminProducts } from "../../services/products";
import type { Product } from "../../types/product";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  useEffect(() => { void getAdminProducts().then(setProducts); }, []);
  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter((product) => product.is_active).length,
    out: products.filter((product) => product.stock_quantity === 0).length,
    revenue: 18420,
  }), [products]);
  const cards = [
    ["Totali i produkteve", stats.total, Package],
    ["Produkte aktive", stats.active, Warehouse],
    ["Jashtë stokut", stats.out, ShoppingBag],
    ["Të ardhurat totale", formatCurrency(stats.revenue), CircleDollarSign],
  ] as const;
  return (
    <section>
      <h1 className="text-3xl font-black">Paneli</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => <Card key={label} className="p-5"><Icon className="h-5 w-5 text-primary" /><p className="mt-3 text-sm text-muted-foreground">{label}</p><p className="text-2xl font-black">{value}</p></Card>)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5"><h2 className="font-black">Porositë e fundit</h2><p className="mt-4 rounded-md bg-slate-50 p-6 text-center text-sm text-muted-foreground">Porositë do të shfaqen këtu pas checkout-it.</p></Card>
        <Card className="p-5"><h2 className="font-black">Telefonat e importuar së fundi</h2><div className="mt-4 space-y-3">{products.filter((p) => p.imported_from_api).slice(0, 4).map((p) => <div key={p.id} className="flex justify-between text-sm"><span>{p.name}</span><strong>{p.brand}</strong></div>)}{!products.some((p) => p.imported_from_api) && <p className="rounded-md bg-slate-50 p-6 text-center text-sm text-muted-foreground">Ende nuk ka importe nga API.</p>}</div></Card>
      </div>
      <Card className="mt-6 p-5">
        <h2 className="font-black">Ndrysho faqen kryesore</h2>
        <p className="mt-2 text-sm text-muted-foreground">Menaxho shërbimet, bannerat e ofertave dhe produktet që shfaqen në ballinë.</p>
        <Link to="/admin/homepage"><Button className="mt-4">Hap editorin e homepage</Button></Link>
      </Card>
    </section>
  );
}
