import { Search, ShoppingCart } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { seedProducts } from "../../data/seedProducts";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../lib/utils";
import { ProductImage } from "../ui/ProductImage";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function SearchBox({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    return seedProducts
      .map((product) => ({ product, score: scoreProduct(product, needle) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.product);
  }, [query]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setFocused(false);
    navigate(`/products?search=${encodeURIComponent(value)}`);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={submit}>
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
        <Input
          className="h-12 rounded-lg border-0 bg-zinc-100 pl-12 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Kerko produkte"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
        />
      </form>
      {focused && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-lg border bg-white shadow-soft">
          {matches.length ? (
            <div className="divide-y">
              {matches.map((product) => (
                <div key={product.id} className="grid grid-cols-[64px_1fr] gap-3 p-3">
                  <Link to={`/products/${product.slug}`} onClick={() => setFocused(false)}>
                    <ProductImage className="h-16 w-16 rounded-md object-contain p-1" src={product.main_image_url} alt={product.name} seed={product.name} />
                  </Link>
                  <div className="min-w-0">
                    <Link to={`/products/${product.slug}`} onClick={() => setFocused(false)} className="block truncate text-sm font-black hover:text-primary">
                      {product.name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {product.brand} · {product.specs.processor} · {product.specs.storage}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <strong className="text-sm">{formatCurrency(product.price)}</strong>
                      <Button size="sm" type="button" onClick={() => addToCart(product)}>
                        <ShoppingCart className="h-3.5 w-3.5" /> Shto
                      </Button>
                      <Link to={`/products/${product.slug}`} onClick={() => setFocused(false)} className="text-xs font-bold text-primary">
                        Shiko detajet
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="w-full bg-orange-50 px-4 py-3 text-left text-sm font-bold text-orange-900" onClick={() => {
                setFocused(false);
                navigate(`/products?search=${encodeURIComponent(query.trim())}`);
              }}>
                Shiko të gjitha rezultatet dhe modelet me specifika të ngjashme
              </button>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-sm font-bold">Nuk u gjet rezultat i saktë.</p>
              <button type="button" className="mt-2 text-sm font-bold text-primary" onClick={() => {
                setFocused(false);
                navigate(`/products?search=${encodeURIComponent(query.trim())}`);
              }}>
                Kërko modele të ngjashme
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function scoreProduct(product: (typeof seedProducts)[number], query: string) {
  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.specs.processor,
    product.specs.display,
    product.specs.storage,
    product.specs.ram,
    product.specs.rear_camera,
    product.specs.operating_system,
    product.network,
  ].join(" ").toLowerCase();
  if (product.name.toLowerCase().includes(query)) return 100;
  if (product.brand.toLowerCase().includes(query)) return 70;
  if (haystack.includes(query)) return 40;
  return query.split(/\s+/).filter((word) => haystack.includes(word)).length * 10;
}
