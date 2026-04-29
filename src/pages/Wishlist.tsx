import { ProductCard } from "../components/products/ProductCard";
import { Card } from "../components/ui/card";
import { useWishlist } from "../hooks/useWishlist";

export default function Wishlist() {
  const { wishlist } = useWishlist();
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">Lista e dëshirave</h1>
      {wishlist.length ? <div className="mt-6 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">{wishlist.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <Card className="mt-6 p-8 text-center text-muted-foreground">Produktet e ruajtura do të shfaqen këtu.</Card>}
    </div>
  );
}
