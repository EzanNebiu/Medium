import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import { SiApple, SiGoogle, SiOneplus, SiSamsung, SiXiaomi } from "react-icons/si";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { formatCurrency } from "../../lib/utils";
import { sqAvailability, sqDelivery } from "../../lib/albanian";
import type { Product } from "../../types/product";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ProductImage } from "../ui/ProductImage";

const brandIcons: Record<string, IconType> = {
  Apple: SiApple,
  Samsung: SiSamsung,
  Xiaomi: SiXiaomi,
  Google: SiGoogle,
  OnePlus: SiOneplus,
};

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggle, isSaved } = useWishlist();
  const BrandIcon = brandIcons[product.brand];
  return (
    <Card className="group flex h-full min-h-[520px] overflow-hidden border-0 bg-zinc-100">
      <div className="grid h-full w-full grid-rows-[240px_1fr]">
      <div className="relative h-60 bg-zinc-100">
        <ProductImage className="mx-auto h-full w-full max-w-[260px] bg-transparent object-contain p-7 transition duration-300 group-hover:scale-105" src={product.main_image_url} alt={product.name} seed={product.name} />
        <div className="absolute left-4 top-4 flex max-w-[calc(100%-5rem)] flex-col items-start gap-1.5">
          {Boolean(product.discount_percentage) && <Badge className="w-fit whitespace-nowrap border-orange-200 bg-white px-2 py-0.5 text-primary">-{product.discount_percentage}%</Badge>}
          <Badge className="w-fit max-w-full whitespace-nowrap border-orange-200 bg-orange-50 px-2 py-0.5 text-orange-700">{sqDelivery(product.delivery_badge)}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 bg-transparent text-zinc-500 hover:bg-white hover:text-primary" onClick={() => void toggle(product)}>
          <Heart className={`h-4 w-4 ${isSaved(product.id) ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </div>
      <div className="grid grid-rows-[84px_32px_60px_1fr] p-5 text-center">
        <div className="min-h-0">
          <p className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            {BrandIcon && <BrandIcon className="h-3.5 w-3.5" />}
            {product.brand}
          </p>
          <Link to={`/products/${product.slug}`} className="mt-2 line-clamp-2 block text-lg font-bold leading-snug hover:text-primary">{product.name}</Link>
        </div>
        <div className="flex min-h-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{product.rating.toFixed(1)}</span>
          <span>({product.reviews_count})</span>
          <span className={product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}>{sqAvailability(product.availability)}</span>
        </div>
        <div className="flex min-h-0 flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="text-3xl font-black">{formatCurrency(product.price)}</span>
          {product.old_price && <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.old_price)}</span>}
        </div>
        <div className="grid content-end gap-2 pt-4">
          <Button size="lg" className="w-full px-2 text-sm" onClick={() => addToCart(product)}>
            <ShoppingCart className="h-4 w-4" /> Shto në shportë
          </Button>
          <Link className="block" to={`/products/${product.slug}`}>
            <Button size="sm" variant="outline" className="w-full px-2 text-sm">
              <Eye className="h-4 w-4" /> Shiko detajet
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </Card>
  );
}
