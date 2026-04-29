import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductForm } from "../../components/admin/ProductForm";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { getProductById } from "../../services/products";
import type { Product } from "../../types/product";

export default function AdminEditProduct() {
  const { id = "" } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void getProductById(id).then((item) => {
      if (!active) return;
      setProduct(item);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setProduct(null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <section>
      <h1 className="text-3xl font-black">Ndrysho produktin</h1>
      <p className="mt-2 text-muted-foreground">Përditëso çmimin, stokun, fotot, specifikat, garancinë, dërgesën dhe statusin.</p>
      <div className="mt-6">
        {loading && <Card className="p-6 text-sm font-semibold text-muted-foreground">Produkti po ngarkohet...</Card>}
        {!loading && product && <ProductForm initial={product} />}
        {!loading && !product && (
          <Card className="space-y-3 p-6">
            <h2 className="text-xl font-black">Produkti nuk u gjet</h2>
            <p className="text-sm text-muted-foreground">Kontrollo nëse produkti ekziston, ose krijo një produkt të ri manualisht.</p>
            <Link to="/admin/products/new"><Button>Krijo produkt të ri</Button></Link>
          </Card>
        )}
      </div>
    </section>
  );
}
