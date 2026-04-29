import { ArrowRight, Headphones, ShieldCheck, Truck, WalletCards, Wrench, PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/products/ProductCard";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { categories, seedProducts } from "../data/seedProducts";
import { sqCategory } from "../lib/albanian";

const trust = [
  ["Dërgesë e shpejtë në Kosovë", Truck],
  ["Produkte origjinale", ShieldCheck],
  ["Garanci e përfshirë", Wrench],
  ["Pagesë e sigurt", WalletCards],
  ["Mbështetje për klientë", PhoneCall],
];

export default function Home() {
  const featured = seedProducts.filter((product) => product.is_featured).slice(0, 4);
  const arrivals = [...seedProducts].slice(4, 8);

  return (
    <div>
      <section className="bg-white">
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-primary">Java e ofertave Medium Mobil Shop</span>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Telefona flagship, garanci zyrtare, çmime të qarta.</h1>
            <p className="max-w-xl text-lg text-muted-foreground">Bli iPhone, Samsung Galaxy, Pixel, Xiaomi, OnePlus dhe aksesorë me dërgesë të shpejtë në gjithë Kosovën.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products"><Button size="lg">Shfleto ofertat <ArrowRight className="h-5 w-5" /></Button></Link>
              <Link to="/products?category=Accessories"><Button size="lg" variant="outline">Aksesorë</Button></Link>
            </div>
          </div>
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
            {seedProducts.slice(1, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-3 py-8 md:grid-cols-5">
        {trust.map(([label, Icon]) => (
          <Card key={label as string} className="flex items-center gap-3 p-4">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold">{label as string}</span>
          </Card>
        ))}
      </section>

      <section className="container-page py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black">Produktet e veçuara</h2>
          <Link className="text-sm font-bold text-primary" to="/products">Shiko të gjitha</Link>
        </div>
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container-page grid gap-6 py-8 lg:grid-cols-2">
        <Card className="bg-slate-950 p-8 text-white">
          <h2 className="text-3xl font-black">Oferta speciale</h2>
          <p className="mt-2 text-slate-300">Kombino telefonin me mbushës, këllëf dhe kufje për çmim më të mirë në fund.</p>
          <Link to="/products"><Button className="mt-6 bg-white text-slate-950 hover:bg-slate-100">Shfleto ofertat</Button></Link>
        </Card>
        <Card className="p-8">
          <h2 className="text-3xl font-black">Brendet më të kërkuara</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Apple", "Samsung", "Xiaomi", "Google", "OnePlus", "Medium Mobil"].map((brand) => (
              <Link key={brand} to={`/products?brand=${brand}`} className="rounded-full border px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary">{brand}</Link>
            ))}
          </div>
        </Card>
      </section>

      <section className="container-page py-8">
        <h2 className="mb-5 text-2xl font-black">Produktet më të reja</h2>
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {arrivals.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container-page py-8">
        <h2 className="mb-5 text-2xl font-black">Bli sipas kategorisë</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link key={category} to={`/products?category=${encodeURIComponent(category)}`}>
              <Card className="flex h-24 items-center justify-between p-4 hover:border-primary">
                <span className="font-bold">{sqCategory(category)}</span>
                <Headphones className="h-5 w-5 text-primary" />
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
