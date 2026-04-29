import { Filter, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductFiltersPanel } from "../components/products/ProductFilters";
import { ProductCard } from "../components/products/ProductCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Select } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { applyFilters, getProducts } from "../services/products";
import type { Product, ProductFilters, SortOption } from "../types/product";

const initialFilters: ProductFilters = {
  query: "",
  categories: [],
  brands: [],
  minPrice: 0,
  maxPrice: 1500,
  storage: [],
  ram: [],
  condition: [],
  network: [],
  screenType: [],
  warranty: [],
  availability: [],
  colors: [],
};

export default function Products() {
  const [params] = useSearchParams();
  const paramKey = params.toString();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    ...initialFilters,
    query: params.get("search") ?? "",
    categories: params.get("category") ? [params.get("category") as string] : [],
    brands: params.get("brand") ? [params.get("brand") as string] : [],
  });
  const [sort, setSort] = useState<SortOption>("relevance");
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const nextParams = new URLSearchParams(paramKey);
    const query = nextParams.get("search") ?? "";
    const category = nextParams.get("category");
    const brand = nextParams.get("brand");
    setFilters((current) => ({
      ...current,
      query,
      categories: category ? [category] : [],
      brands: brand ? [brand] : [],
    }));
  }, [paramKey]);

  const visible = useMemo(() => applyFilters(products, filters, sort), [products, filters, sort]);
  const activeChips = Object.entries(filters).flatMap(([key, value]) => Array.isArray(value) ? value.map((item) => ({ key, item })) : []);

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black">Telefona mobilë dhe aksesorë</h1>
          <p className="mt-2 text-muted-foreground">Filtro sipas brendit, specifikave, garancisë, stokut dhe çmimit.</p>
        </div>
        <div className="flex gap-2">
          <Button className="md:hidden" variant="outline" onClick={() => setMobileFilters(true)}><Filter className="h-4 w-4" /> Filtrat</Button>
          <Select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
            <option value="relevance">Më relevante</option>
            <option value="newest">Më të rejat</option>
            <option value="price-asc">Çmimi nga më i ulëti</option>
            <option value="price-desc">Çmimi nga më i larti</option>
            <option value="discount">Zbritja më e madhe</option>
          </Select>
        </div>
      </div>
      {activeChips.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {activeChips.map((chip) => <Badge key={`${chip.key}-${chip.item}`} className="bg-white">{chip.item}</Badge>)}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="hidden md:block"><ProductFiltersPanel products={products} filters={filters} onChange={setFilters} /></div>
        <div>
          {loading ? (
            <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-96" />)}</div>
          ) : visible.length ? (
            <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          ) : (
            <div className="rounded-lg border bg-white p-12 text-center">
              <h2 className="text-xl font-black">Nuk u gjetën produkte</h2>
              <p className="mt-2 text-muted-foreground">Provo të pastrosh filtrat ose kërko një model tjetër.</p>
            </div>
          )}
        </div>
      </div>
      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden">
          <div className="ml-auto h-full w-80 overflow-auto bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black">Filtrat</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileFilters(false)}><X className="h-5 w-5" /></Button>
            </div>
            <ProductFiltersPanel products={products} filters={filters} onChange={setFilters} />
          </div>
        </div>
      )}
    </div>
  );
}
