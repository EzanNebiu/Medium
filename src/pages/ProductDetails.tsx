import { Battery, Cpu, Heart, Minus, Plus, ShoppingBag, ShoppingCart, Smartphone, Star, Truck, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductCard } from "../components/products/ProductCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ProductImage } from "../components/ui/ProductImage";
import { Select } from "../components/ui/select";
import { showToast } from "../components/ui/toast";
import { seedProducts } from "../data/seedProducts";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { formatCurrency } from "../lib/utils";
import { getProductById } from "../services/products";
import { createReview, getProductReviews } from "../services/reviews";
import type { Product } from "../types/product";
import type { Review } from "../types/review";
import { sqCondition, sqDelivery, translateToAlbanian } from "../lib/albanian";

export default function ProductDetails() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImage, setActiveImage] = useState("");
  const [color, setColor] = useState("");
  const [storage, setStorage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useCart();
  const { toggle } = useWishlist();

  useEffect(() => {
    let active = true;
    setLoading(true);
    void Promise.all([
      getProductById(id),
      getProductReviews(id)
    ]).then(([item, reviewData]) => {
      if (!active) return;
      setProduct(item);
      setReviews(reviewData);
      setActiveImage(item?.main_image_url ?? "");
      setColor(item?.colors[0] ?? "");
      setStorage(item?.storage_options[0] ?? "");
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setProduct(null);
      setReviews([]);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Duhet të jesh i kyçur për të lënë vlerësim", "error");
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    setSubmittingReview(true);
    const { error } = await createReview(id, rating, comment);
    setSubmittingReview(false);

    if (error) {
      showToast("Vlerësimi nuk u ruajt", "error");
      return;
    }

    showToast("Vlerësimi u shtua me sukses!");
    setComment("");
    setRating(5);
    
    // Reload reviews
    const reviewData = await getProductReviews(id);
    setReviews(reviewData);
  };

  const similar = useMemo(() => seedProducts.filter((item) => item.brand === product?.brand && item.id !== product?.id).slice(0, 4), [product]);

  if (loading) return <div className="container-page py-12">Produkti po ngarkohet...</div>;
  if (!product) {
    return (
      <div className="container-page py-12">
        <h1 className="text-3xl font-black">Produkti nuk u gjet</h1>
        <p className="mt-2 text-muted-foreground">Produkti mund të jetë fshirë, joaktiv ose linku nuk është i saktë.</p>
        <Link to="/products" className="mt-5 inline-flex"><Button>Kthehu te produktet</Button></Link>
      </div>
    );
  }

  const specs = product.specs;
  const specsRows = [
    ["Ekrani", specs.display],
    ["Procesori", specs.processor],
    ["RAM", specs.ram],
    ["Memoria", specs.storage],
    ["Kamera e pasme", specs.rear_camera],
    ["Kamera e përparme", specs.front_camera],
    ["Bateria", specs.battery],
    ["Mbushja", specs.charging],
    ["OS", specs.operating_system],
    ["Rrjeti", specs.network],
    ["SIM", specs.sim],
    ["Dimensionet", specs.dimensions],
    ["Pesha", specs.weight],
    ["Ngjyrat", specs.colors],
    ["Data e lansimit", specs.release_date],
  ];

  return (
    <div className="container-page section-air">
      <div className="mb-14 flex flex-wrap items-center gap-3 text-base text-zinc-400">
        <Link to="/" className="hover:text-black">Ballina</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-black">Produktet</Link>
        <span>/</span>
        <span className="font-semibold text-black">{product.name}</span>
      </div>
      <section className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="grid min-w-0 gap-3 md:grid-cols-[96px_1fr]">
          <div className="flex gap-3 overflow-x-auto overflow-y-hidden md:flex-col md:overflow-x-hidden md:overflow-y-auto">
            {[product.main_image_url, ...product.gallery_images].map((image) => (
              <button key={image} className={`aspect-square w-20 shrink-0 rounded-md border bg-white p-1 transition ${activeImage === image ? "border-black" : "border-black/10 opacity-60 hover:opacity-100"}`} onClick={() => setActiveImage(image)}>
                <ProductImage className="h-full w-full rounded bg-transparent object-contain" src={image} alt={product.name} seed={product.name} />
              </button>
            ))}
          </div>
          <div className="aspect-square min-h-0 overflow-hidden rounded-lg bg-white p-2 sm:p-4">
            <ProductImage className="h-full w-full bg-transparent object-contain" src={activeImage} alt={product.name} seed={product.name} />
          </div>
        </div>
        <div className="min-w-0 space-y-5">
          <div>
            <p className="text-sm font-black uppercase text-primary">{product.brand}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-5xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="bg-green-50 text-green-700">{product.stock_quantity > 0 ? "Në stok" : "Nuk ka stok"}</Badge>
              <Badge className="bg-orange-50 text-primary">{sqDelivery(product.delivery_badge)}</Badge>
              {product.condition && (
                <Badge className={`${
                  product.condition === "new" ? "bg-green-50 text-green-700" :
                  product.condition === "open-box" ? "bg-blue-50 text-blue-700" :
                  "bg-purple-50 text-purple-700"
                }`}>
                  {sqCondition(product.condition)}
                </Badge>
              )}
              {product.warranty_months > 0 ? (
                <Badge>{product.warranty_months} muj garanci</Badge>
              ) : (
                <Badge className="bg-red-50 text-red-700">Pa garanci</Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-3xl font-black sm:text-5xl">{formatCurrency(product.price)}</span>
            {product.old_price && <span className="text-lg text-muted-foreground line-through">{formatCurrency(product.old_price)}</span>}
            {Boolean(product.discount_percentage) && <Badge className="bg-red-50 text-red-700">-{product.discount_percentage}%</Badge>}
          </div>
          <div className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {product.rating.toFixed(1)} nga {product.reviews_count} vlerësime</div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Ekrani", specs.display, Smartphone],
              ["Procesori", specs.processor, Cpu],
              ["Bateria", specs.battery, Battery],
              ["Dërgesa", sqDelivery(product.delivery_badge), Truck],
              ["Garancia", product.warranty_months > 0 ? `${product.warranty_months} muj` : "Pa garanci", Wrench],
              ["Stoku", product.stock_quantity > 0 ? "Në stok" : "Nuk ka stok", ShoppingBag],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="rounded-lg bg-zinc-100 p-4">
                <Icon className="h-5 w-5 text-zinc-500" />
                <p className="mt-2 text-xs text-zinc-400">{String(label)}</p>
                <strong className="line-clamp-2 text-sm">{String(value)}</strong>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground">{product.full_description}</p>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-sm font-bold">Ngjyra<Select className="mt-2" value={color} onChange={(e) => setColor(e.target.value)}>{product.colors.map((item) => <option key={item}>{translateToAlbanian(item)}</option>)}</Select></label>
            <label className="text-sm font-bold">Memoria<Select className="mt-2" value={storage} onChange={(e) => setStorage(e.target.value)}>{product.storage_options.map((item) => <option key={item}>{item}</option>)}</Select></label>
            <label className="text-sm font-bold">Sasia
              <div className="mt-2 flex h-11 items-center justify-center rounded-md border bg-white">
                <Button variant="ghost" size="icon" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="flex-1 text-center font-bold">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity((value) => value + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </label>
          </div>
          <div className="space-y-3">
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <Button className="min-w-0 w-full" onClick={() => addToCart(product, quantity, color, storage)}><ShoppingCart className="h-4 w-4" /> Shto në shportë</Button>
              <Button className="min-w-0 w-full" variant="outline" onClick={() => void toggle(product)}><Heart className="h-4 w-4" /> Lista e dëshirave</Button>
            </div>
            <Button className="w-full" variant="secondary" onClick={() => { addToCart(product, quantity, color, storage); navigate("/checkout"); }}><ShoppingBag className="h-4 w-4" /> Bli tani</Button>
          </div>
        </div>
      </section>
      <section className="mt-24 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg bg-white p-8">
          <h2 className="text-xl font-black">Specifikat kryesore</h2>
          <div className="mt-4 grid gap-3 text-sm">{specsRows.slice(0, 8).map(([label, value]) => <div key={label} className="grid gap-1 sm:grid-cols-[minmax(90px,0.8fr)_1fr] sm:gap-4"><span className="text-muted-foreground">{label}</span><strong className="min-w-0 sm:text-right">{value}</strong></div>)}</div>
        </div>
        <div className="rounded-lg bg-white p-8">
          <h2 className="text-xl font-black">Tabela e plotë e specifikave</h2>
          <div className="mt-4 divide-y text-sm">{specsRows.map(([label, value]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-4"><strong>{label}</strong><span className="min-w-0">{value}</span></div>)}</div>
        </div>
      </section>
      <section className="mt-10 rounded-lg bg-white p-8">
        <h2 className="text-xl font-black">Vlerësimet ({reviews.length})</h2>
        
        {user ? (
          <form onSubmit={(e) => void handleSubmitReview(e)} className="mt-6 space-y-4 rounded-lg border bg-zinc-50 p-5">
            <h3 className="font-bold">Lë një vlerësim</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Vlerësimi:</span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="transition hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              required
              className="min-h-24 w-full rounded-md border p-3 text-sm"
              placeholder="Shkruaj mendimin tënd për këtë produkt..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button type="submit" disabled={submittingReview}>
              {submittingReview ? "Po ruhet..." : "Dërgo vlerësimin"}
            </Button>
          </form>
        ) : (
          <div className="mt-4 rounded-lg border bg-zinc-50 p-5">
            <p className="text-sm text-muted-foreground">
              <Link to="/login" state={{ from: `/products/${id}` }} className="font-bold text-primary hover:underline">
                Kyçu
              </Link>
              {" "}ose{" "}
              <Link to="/register" state={{ from: `/products/${id}` }} className="font-bold text-primary hover:underline">
                regjistrohu
              </Link>
              {" "}për të lënë një vlerësim.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ky produkt nuk ka vlerësime ende. Ji i pari që e vlerëson!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg border bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{review.user_name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{review.comment}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("sq-AL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-black">Produkte të ngjashme</h2>
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">{similar.map((item) => <ProductCard key={item.id} product={item} />)}</div>
      </section>
    </div>
  );
}
