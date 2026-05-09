import { productImage, seedProducts } from "../data/seedProducts";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { slugify } from "../lib/utils";
import type { Product, ProductFilters, ProductSpecs, SortOption } from "../types/product";

export async function getProducts() {
  if (!isSupabaseConfigured) return seedProducts;

  const { data, error } = await supabase
    .from("products")
    .select("*, product_specs(*), categories(name, slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) return seedProducts;
  return data.map(mapProductFromDb);
}

export async function getProductById(idOrSlug: string) {
  const local = seedProducts.find((product) => product.id === idOrSlug || product.slug === idOrSlug);
  if (!isSupabaseConfigured) return local ?? null;

  const query = supabase
    .from("products")
    .select("*, product_specs(*), categories(name, slug)");

  const { data, error } = await (isUuid(idOrSlug)
    ? query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`).maybeSingle()
    : query.eq("slug", idOrSlug).maybeSingle());

  if (error || !data) return local ?? null;
  return mapProductFromDb(data);
}

export async function getAdminProducts() {
  if (!isSupabaseConfigured) return seedProducts;
  const { data, error } = await supabase.from("products").select("*, product_specs(*), categories(name, slug)").order("created_at", { ascending: false });
  if (error || !data) return seedProducts;
  return data.map(mapProductFromDb);
}

export async function saveProduct(input: Partial<Product> & { specs?: ProductSpecs }) {
  if (!isSupabaseConfigured) {
    return { product: { ...seedProducts[0], ...input, id: crypto.randomUUID(), slug: slugify(input.name ?? "manual-product") } as Product, error: null };
  }

  const productPayload = {
    name: input.name,
    slug: input.slug ?? slugify(input.name ?? ""),
    brand: input.brand,
    price: input.price,
    old_price: input.old_price,
    discount_percentage: input.discount_percentage,
    stock_quantity: input.stock_quantity,
    condition: input.condition,
    warranty_months: input.warranty_months,
    delivery_badge: input.delivery_badge,
    is_featured: input.is_featured,
    is_active: input.is_active,
    main_image_url: input.main_image_url,
    gallery_images: input.gallery_images ?? [],
    short_description: input.short_description,
    full_description: input.full_description,
    imported_from_api: input.imported_from_api,
    api_source: input.api_source,
    api_device_id: input.api_device_id,
    raw_api_response: null,
  };

  const { data, error } = await supabase.from("products").insert(productPayload).select().single();
  if (error) return { product: null, error };

  if (input.specs) {
    await supabase.from("product_specs").insert({ ...input.specs, product_id: data.id });
  }

  await supabase.from("api_import_logs").insert({
    search_query: input.name,
    selected_device: input.api_device_id ?? input.name,
    status: input.imported_from_api ? "imported" : "manual",
  });

  return { product: mapProductFromDb(data), error: null };
}

export function applyFilters(products: Product[], filters: ProductFilters, sort: SortOption) {
  const filtered = products.filter((product) => {
    const query = filters.query.toLowerCase();
    const matchesQuery = !query || getSearchText(product).includes(query) || query.split(/\s+/).some((word) => word.length > 1 && getSearchText(product).includes(word));
    const minPrice = Number.isFinite(filters.minPrice) ? filters.minPrice : 0;
    const maxPrice = Number.isFinite(filters.maxPrice) ? filters.maxPrice : Number.POSITIVE_INFINITY;
    const betweenPrice = product.price >= minPrice && product.price <= maxPrice;
    const includes = (values: string[], candidate: string) => values.length === 0 || values.includes(candidate);
    return (
      matchesQuery &&
      betweenPrice &&
      includes(filters.categories, product.category) &&
      includes(filters.brands, product.brand) &&
      (filters.storage.length === 0 || product.storage_options.some((item) => filters.storage.includes(item))) &&
      (filters.ram.length === 0 || product.ram_options.some((item) => filters.ram.includes(item))) &&
      includes(filters.condition, product.condition) &&
      includes(filters.network, product.network) &&
      includes(filters.screenType, product.screen_type) &&
      (filters.warranty.length === 0 || filters.warranty.includes(`${product.warranty_months} months`) || filters.warranty.includes(`${product.warranty_months} muaj`)) &&
      includes(filters.availability, product.availability) &&
      (filters.colors.length === 0 || product.colors.some((item) => filters.colors.includes(item)))
    );
  });

  return [...filtered].sort((a, b) => {
    if (filters.query.trim()) return searchScore(b, filters.query) - searchScore(a, filters.query);
    if (sort === "newest") return Date.parse(b.created_at) - Date.parse(a.created_at);
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "discount") return (b.discount_percentage ?? 0) - (a.discount_percentage ?? 0);
    return Number(b.is_featured) - Number(a.is_featured);
  });
}

function getSearchText(product: Product) {
  return [
    product.name,
    product.brand,
    product.category,
    product.short_description,
    product.full_description,
    product.specs.display,
    product.specs.processor,
    product.specs.ram,
    product.specs.storage,
    product.specs.rear_camera,
    product.specs.front_camera,
    product.specs.battery,
    product.specs.charging,
    product.specs.operating_system,
    product.specs.network,
    product.specs.colors,
    product.network,
    product.operating_system,
    product.screen_type,
    product.storage_options.join(" "),
    product.ram_options.join(" "),
  ].join(" ").toLowerCase();
}

function searchScore(product: Product, query: string) {
  const needle = query.trim().toLowerCase();
  const text = getSearchText(product);
  let score = 0;
  if (product.name.toLowerCase().includes(needle)) score += 100;
  if (product.brand.toLowerCase().includes(needle)) score += 50;
  if (product.specs.processor.toLowerCase().includes(needle)) score += 35;
  if (product.specs.storage.toLowerCase().includes(needle)) score += 25;
  score += needle.split(/\s+/).filter((word) => word.length > 1 && text.includes(word)).length * 8;
  return score;
}

function mapProductFromDb(row: Record<string, unknown>): Product {
  const specs = Array.isArray(row.product_specs) ? row.product_specs[0] : row.product_specs;
  const categoryRelation = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const categoryName = categoryRelation && typeof categoryRelation === "object" && "name" in categoryRelation
    ? String((categoryRelation as { name?: unknown }).name ?? "Phones")
    : String(row.category ?? row.brand ?? "Phones");
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    brand: String(row.brand ?? "Medium Mobil"),
    category: categoryName,
    category_id: (row.category_id as string | null) ?? null,
    price: Number(row.price ?? 0),
    old_price: row.old_price ? Number(row.old_price) : null,
    discount_percentage: row.discount_percentage ? Number(row.discount_percentage) : 0,
    stock_quantity: Number(row.stock_quantity ?? 0),
    condition: (row.condition as Product["condition"]) ?? "new",
    warranty_months: Number(row.warranty_months ?? 24),
    delivery_badge: String(row.delivery_badge ?? "Fast delivery"),
    is_featured: Boolean(row.is_featured),
    is_active: Boolean(row.is_active),
    main_image_url: String(row.main_image_url || productImage(String(row.name ?? ""), categoryName)),
    gallery_images: ((row.gallery_images as string[]) ?? []).length ? (row.gallery_images as string[]) : [productImage(String(row.name ?? ""), categoryName)],
    short_description: String(row.short_description ?? ""),
    full_description: String(row.full_description ?? ""),
    imported_from_api: Boolean(row.imported_from_api),
    api_source: (row.api_source as string | null) ?? null,
    api_device_id: (row.api_device_id as string | null) ?? null,
    rating: 4.6,
    reviews_count: 0,
    colors: String((specs as ProductSpecs | undefined)?.colors ?? "Black").split(", "),
    storage_options: [String((specs as ProductSpecs | undefined)?.storage ?? "128GB")],
    ram_options: [String((specs as ProductSpecs | undefined)?.ram ?? "8GB")],
    screen_type: "OLED",
    network: String((specs as ProductSpecs | undefined)?.network ?? "5G"),
    operating_system: String((specs as ProductSpecs | undefined)?.operating_system ?? "Android"),
    availability: Number(row.stock_quantity ?? 0) > 0 ? "in-stock" : "out-of-stock",
    specs: (specs as ProductSpecs | undefined) ?? seedProducts[0].specs,
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
