export type ProductCondition = "new" | "open-box" | "refurbished";

export type ProductSpecs = {
  id?: string;
  product_id?: string;
  display: string;
  processor: string;
  ram: string;
  storage: string;
  rear_camera: string;
  front_camera: string;
  battery: string;
  charging: string;
  operating_system: string;
  network: string;
  sim: string;
  dimensions: string;
  weight: string;
  colors: string;
  release_date: string;
  full_specs?: Record<string, string | string[]>;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  category_id?: string | null;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  stock_quantity: number;
  condition: ProductCondition;
  warranty_months: number;
  delivery_badge: string;
  is_featured: boolean;
  is_active: boolean;
  main_image_url: string;
  gallery_images: string[];
  short_description: string;
  full_description: string;
  imported_from_api: boolean;
  api_source?: string | null;
  api_device_id?: string | null;
  rating: number;
  reviews_count: number;
  colors: string[];
  storage_options: string[];
  ram_options: string[];
  screen_type: string;
  network: string;
  operating_system: string;
  availability: "in-stock" | "low-stock" | "out-of-stock";
  specs: ProductSpecs;
  created_at: string;
};

export type ProductFilters = {
  query: string;
  categories: string[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
  storage: string[];
  ram: string[];
  condition: string[];
  network: string[];
  screenType: string[];
  warranty: string[];
  availability: string[];
  colors: string[];
};

export type SortOption = "relevance" | "newest" | "price-asc" | "price-desc" | "discount";
