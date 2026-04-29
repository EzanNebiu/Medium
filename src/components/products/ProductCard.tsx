import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { formatCurrency } from "../../lib/utils";
import { sqAvailability, sqDelivery } from "../../lib/albanian";
import type { Product } from "../../types/product";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ProductImage } from "../ui/ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggle, isSaved } = useWishlist();
  return (
    <Card className="group flex h-full min-h-[430px] overflow-hidden">
      <div className="flex w-full flex-col">
      <div className="relative aspect-[4/3] bg-slate-50">
        <ProductImage className="h-full w-full object-contain p-4 transition group-hover:scale-105" src={product.main_image_url} alt={product.name} seed={product.name} />
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-5rem)] flex-col items-start gap-1.5">
          {Boolean(product.discount_percentage) && <Badge className="w-fit whitespace-nowrap border-red-200 bg-red-50 px-2 py-0.5 text-red-700">-{product.discount_percentage}%</Badge>}
          <Badge className="w-fit max-w-full whitespace-nowrap border-orange-200 bg-orange-50 px-2 py-0.5 text-orange-700">{sqDelivery(product.delivery_badge)}</Badge>
        </div>
        <Button variant="outline" size="icon" className="absolute right-3 top-3 bg-white/90" onClick={() => void toggle(product)}>
          <Heart className={`h-4 w-4 ${isSaved(product.id) ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="min-h-[76px]">
          <p className="text-xs font-bold uppercase text-primary">{product.brand}</p>
          <Link to={`/products/${product.slug}`} className="mt-1 line-clamp-2 block font-bold leading-snug hover:text-primary">{product.name}</Link>
        </div>
        <div className="mt-2 flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{product.rating.toFixed(1)}</span>
          <span>({product.reviews_count})</span>
          <span className={product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}>{sqAvailability(product.availability)}</span>
        </div>
        <div className="mt-3 flex min-h-8 flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-xl font-black">{formatCurrency(product.price)}</span>
          {product.old_price && <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.old_price)}</span>}
        </div>
        <div className="mt-auto grid gap-2 pt-4">
          <Button size="sm" className="w-full px-2 text-xs sm:text-sm" onClick={() => addToCart(product)}>
            <ShoppingCart className="h-4 w-4" /> Shto në shportë
          </Button>
          <Link className="block" to={`/products/${product.slug}`}>
            <Button size="sm" variant="outline" className="w-full px-2 text-xs sm:text-sm">
              <Eye className="h-4 w-4" /> Shiko detajet
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </Card>
  );
}
