import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { ProductImage } from "../../components/ui/ProductImage";
import { Select } from "../../components/ui/select";
import { formatCurrency } from "../../lib/utils";
import { getAdminProducts } from "../../services/products";
import type { Product } from "../../types/product";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");

  useEffect(() => { void getAdminProducts().then(setProducts); }, []);
  const brands = Array.from(new Set(products.map((product) => product.brand)));
  const filtered = useMemo(() => products.filter((product) => {
    return (!query || product.name.toLowerCase().includes(query.toLowerCase())) &&
      (brand === "all" || product.brand === brand) &&
      (status === "all" || (status === "active" ? product.is_active : !product.is_active)) &&
      (source === "all" || (source === "imported" ? product.imported_from_api : !product.imported_from_api));
  }), [products, query, brand, status, source]);

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><h1 className="text-3xl font-black">Produktet</h1><p className="text-muted-foreground">Menaxho produktet manuale dhe të importuara.</p></div>
        <Link to="/admin/products/new"><Button><Plus className="h-4 w-4" /> Shto produkt</Button></Link>
      </div>
      <Card className="mt-6 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Kërko produkte" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={brand} onChange={(e) => setBrand(e.target.value)}><option value="all">Të gjitha brendet</option>{brands.map((item) => <option key={item}>{item}</option>)}</Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Të gjitha statuset</option><option value="active">Aktiv</option><option value="inactive">Joaktiv</option></Select>
          <Select value={source} onChange={(e) => setSource(e.target.value)}><option value="all">Të gjitha burimet</option><option value="imported">I importuar</option><option value="manual">Manual</option></Select>
        </div>
        <div className="mt-5 overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground"><tr><th className="py-3">Foto</th><th>Produkti</th><th>Brendi</th><th>Çmimi</th><th>Stoku</th><th>Statusi</th><th>Burimi</th><th>Veprimet</th></tr></thead>
            <tbody className="divide-y">
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td className="py-3"><ProductImage className="h-12 w-12 rounded object-contain p-1" src={product.main_image_url} alt={product.name} seed={product.name} /></td>
                  <td className="font-bold">{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.stock_quantity}</td>
                  <td><Badge className={product.is_active ? "bg-green-50 text-green-700" : "bg-slate-100"}>{product.is_active ? "Aktiv" : "Joaktiv"}</Badge></td>
                  <td><Badge>{product.imported_from_api ? "Importuar nga API" : "Manual"}</Badge></td>
                  <td><div className="flex gap-1"><Link to={`/products/${product.slug}`}><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link><Link to={`/admin/products/${product.id}/edit`}><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></Link><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="p-8 text-center text-muted-foreground">Asnjë produkt nuk përputhet me këta filtra.</p>}
        </div>
      </Card>
    </section>
  );
}
