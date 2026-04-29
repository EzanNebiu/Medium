import type { Product, ProductFilters } from "../../types/product";
import { sqAvailability, sqCategory, sqCondition, sqDelivery, translateToAlbanian } from "../../lib/albanian";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type Props = {
  products: Product[];
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
};

const keys: Array<[keyof ProductFilters, string, (product: Product) => string[]]> = [
  ["categories", "Kategoria", (p) => [p.category]],
  ["brands", "Brendi", (p) => [p.brand]],
  ["storage", "Memoria", (p) => p.storage_options],
  ["ram", "RAM", (p) => p.ram_options],
  ["condition", "Gjendja", (p) => [p.condition]],
  ["network", "Rrjeti", (p) => [p.network]],
  ["screenType", "Lloji i ekranit", (p) => [p.screen_type]],
  ["warranty", "Garancia", (p) => [`${p.warranty_months} muaj`]],
  ["availability", "Disponueshmëria", (p) => [p.availability]],
  ["colors", "Ngjyra", (p) => p.colors],
];

export function ProductFiltersPanel({ products, filters, onChange }: Props) {
  const toggle = (key: keyof ProductFilters, value: string) => {
    const list = filters[key] as string[];
    onChange({ ...filters, [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] });
  };

  return (
    <aside className="space-y-6">
      <div>
        <label className="text-sm font-bold">Kërko produkte</label>
        <Input className="mt-2" value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })} placeholder="Kërko model ose brend" />
      </div>
      <div>
        <label className="text-sm font-bold">Çmimi</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input type="number" value={filters.minPrice} onChange={(event) => onChange({ ...filters, minPrice: Number(event.target.value) })} />
          <Input type="number" value={filters.maxPrice} onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value) })} />
        </div>
      </div>
      {keys.map(([key, label, getter]) => {
        const values = Array.from(new Set(products.flatMap(getter))).filter(Boolean);
        return (
          <div key={key}>
            <h3 className="text-sm font-bold">{label}</h3>
            <div className="mt-2 max-h-44 space-y-2 overflow-auto pr-1">
              {values.map((value) => (
                <label key={value} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={(filters[key] as string[]).includes(value)} onChange={() => toggle(key, value)} />
                  {filterLabel(key, value)}
                </label>
              ))}
            </div>
          </div>
        );
      })}
      <Button variant="outline" className="w-full" onClick={() => onChange({ ...filters, categories: [], brands: [], storage: [], ram: [], condition: [], network: [], screenType: [], warranty: [], availability: [], colors: [] })}>
        Pastro filtrat
      </Button>
    </aside>
  );
}

function filterLabel(key: keyof ProductFilters, value: string) {
  if (key === "categories") return sqCategory(value);
  if (key === "condition") return sqCondition(value);
  if (key === "availability") return sqAvailability(value);
  if (key === "colors") return translateToAlbanian(value);
  if (key === "warranty") return value.replace("months", "muaj");
  return sqDelivery(translateToAlbanian(value));
}
