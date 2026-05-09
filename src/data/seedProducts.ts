import type { Product, ProductSpecs } from "../types/product";
import { calculateDiscount, slugify } from "../lib/utils";

const baseSpecs = (overrides: Partial<ProductSpecs> = {}): ProductSpecs => ({
  display: "Ekran OLED 6.7 inç, rifreskim adaptiv 120Hz",
  processor: "Çipset i nivelit flagship",
  ram: "8GB",
  storage: "128GB",
  rear_camera: "Sistem me tri kamera: wide, ultra-wide dhe telefoto",
  front_camera: "Kamerë selfie 12MP",
  battery: "Bateri për gjithë ditën",
  charging: "Mbushje e shpejtë USB-C dhe mbushje pa kabllo",
  operating_system: "Sistemi më i ri mobil",
  network: "5G, LTE, Wi-Fi 6E, Bluetooth",
  sim: "Nano SIM and eSIM",
  dimensions: "161 x 76 x 8 mm",
  weight: "196 g",
  colors: "Black, Blue, Silver",
  release_date: "2024",
  full_specs: {
    Ekrani: "Panel OLED me mbështetje HDR",
    Siguria: "Zhbllokim me fytyrë ose gjurmë gishti",
    Garancia: "Garanci zyrtare rajonale",
  },
  ...overrides,
});

const rows = [
  ["iPhone 15 128GB", "Apple", "iPhone", 789, 849, "A16 Bionic", "6GB", "128GB", "iOS 17", "Black, Blue, Pink"],
  ["iPhone 16 Pro 256GB", "Apple", "iPhone", 1199, 1299, "A18 Pro", "8GB", "256GB", "iOS 18", "Natural Titanium, Black Titanium"],
  ["iPhone 15 Pro Max 256GB", "Apple", "iPhone", 1129, 1249, "A17 Pro", "8GB", "256GB", "iOS 17", "Blue Titanium, White Titanium"],
  ["Samsung Galaxy S24 Ultra", "Samsung", "Samsung Galaxy", 1099, 1249, "Snapdragon 8 Gen 3", "12GB", "256GB", "Android 14", "Titanium Gray, Black"],
  ["Samsung Galaxy S24", "Samsung", "Samsung Galaxy", 769, 849, "Exynos 2400", "8GB", "256GB", "Android 14", "Onyx Black, Amber Yellow"],
  ["Samsung Galaxy A55 5G", "Samsung", "Samsung Galaxy", 389, 449, "Exynos 1480", "8GB", "128GB", "Android 14", "Ice Blue, Navy"],
  ["Xiaomi 14T Pro", "Xiaomi", "Xiaomi", 699, 779, "Dimensity 9300+", "12GB", "512GB", "Android 14", "Titan Gray, Blue"],
  ["Xiaomi 14", "Xiaomi", "Xiaomi", 799, 899, "Snapdragon 8 Gen 3", "12GB", "256GB", "Android 14", "Black, White, Green"],
  ["Redmi Note 13 Pro", "Xiaomi", "Xiaomi", 299, 349, "Snapdragon 7s Gen 2", "8GB", "256GB", "Android 13", "Midnight Black, Ocean Teal"],
  ["Google Pixel 8", "Google", "Google Pixel", 589, 699, "Google Tensor G3", "8GB", "128GB", "Android 14", "Obsidian, Hazel"],
  ["Google Pixel 8 Pro", "Google", "Google Pixel", 859, 999, "Google Tensor G3", "12GB", "256GB", "Android 14", "Bay, Porcelain"],
  ["OnePlus 12", "OnePlus", "OnePlus", 849, 949, "Snapdragon 8 Gen 3", "16GB", "512GB", "Android 14", "Flowy Emerald, Silky Black"],
  ["OnePlus Nord 4", "OnePlus", "OnePlus", 499, 549, "Snapdragon 7+ Gen 3", "12GB", "256GB", "Android 14", "Mercurial Silver"],
  ["USB-C Fast Charger 65W", "Medium Mobil", "Chargers", 29, 39, "GaN charging controller", "N/A", "N/A", "Accessory", "White, Black"],
  ["MagSafe Wireless Charger", "Medium Mobil", "Chargers", 34, 49, "Qi2 magnetic charging", "N/A", "N/A", "Accessory", "White"],
  ["Wireless Earbuds Pro", "Medium Mobil", "Earbuds", 79, 109, "Active noise cancelling chip", "N/A", "N/A", "Accessory", "Black, White"],
  ["Clear Phone Case", "Medium Mobil", "Cases", 14, 19, "Shock-absorbing TPU", "N/A", "N/A", "Accessory", "Clear"],
  ["Tempered Glass Protector", "Medium Mobil", "Accessories", 9, 14, "9H glass", "N/A", "N/A", "Accessory", "Clear"],
  ["Galaxy Watch 6", "Samsung", "Smartwatches", 249, 299, "Exynos W930", "2GB", "16GB", "Wear OS", "Graphite, Silver"],
  ["Apple Watch Series 9", "Apple", "Smartwatches", 399, 449, "Apple S9", "N/A", "64GB", "watchOS", "Midnight, Starlight"],
] as const;

export const seedProducts: Product[] = rows.map((row, index) => {
  const [name, brand, category, price, oldPrice, processor, ram, storage, os, colors] = row;
  const image = productImage(name, category);
  const specs = baseSpecs({
    processor,
    ram,
    storage,
    operating_system: os,
    colors,
    display: category === "Chargers" || category === "Cases" || category === "Accessories" || category === "Earbuds" ? "Produkt aksesor" : baseSpecs().display,
  });
  return {
    id: `demo-${index + 1}`,
    name,
    slug: slugify(name),
    brand,
    category,
    price,
    old_price: oldPrice,
    discount_percentage: calculateDiscount(price, oldPrice),
    stock_quantity: index % 7 === 0 ? 3 : 18 + index,
    condition: "new",
    warranty_months: category === "Cases" || category === "Accessories" ? 6 : 24,
    delivery_badge: index % 3 === 0 ? "24h delivery" : "Fast delivery",
    is_featured: index < 8,
    is_active: true,
    main_image_url: image,
    gallery_images: [image],
    short_description: `${name} me garanci zyrtare, dërgesë të besueshme dhe mbështetje nga Medium Mobil Shop.`,
    full_description: `${name} është zgjedhur për klientët që duan pajisje origjinale, çmime transparente dhe shërbim të sigurt pas blerjes në Kosovë.`,
    imported_from_api: false,
    api_source: null,
    api_device_id: null,
    rating: 4.3 + ((index % 6) / 10),
    reviews_count: 18 + index * 3,
    colors: colors.split(", "),
    storage_options: storage === "N/A" ? ["Standard"] : [storage, storage === "128GB" ? "256GB" : "512GB"],
    ram_options: ram === "N/A" ? ["Standard"] : [ram],
    screen_type: category.includes("iPhone") || category.includes("Galaxy") || category.includes("Pixel") || category.includes("OnePlus") || category.includes("Xiaomi") ? "OLED" : "Accessory",
    network: category.includes("Phone") || category.includes("iPhone") || category.includes("Galaxy") || category.includes("Pixel") || category.includes("OnePlus") || category.includes("Xiaomi") ? "5G" : "N/A",
    operating_system: os,
    availability: index % 7 === 0 ? "low-stock" : "in-stock",
    specs,
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
  };
});

export const categories = ["iPhone", "Samsung Galaxy", "Xiaomi", "Google Pixel", "OnePlus", "Accessories", "Chargers", "Cases", "Earbuds", "Smartwatches"];

export function productImage(name: string, category: string) {
  const lower = name.toLowerCase();
  const photos: Record<string, string> = {
    "iphone 15 128gb": "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg",
    "iphone 16 pro 256gb": "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-1.jpg",
    "iphone 15 pro max 256gb": "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg",
    "samsung galaxy s24 ultra": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-1.jpg",
    "samsung galaxy s24": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-5g-1.jpg",
    "samsung galaxy a55 5g": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-1.jpg",
    "xiaomi 14t pro": "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14t-pro-1.jpg",
    "xiaomi 14": "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-1.jpg",
    "redmi note 13 pro": "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-5g-1.jpg",
    "google pixel 8": "https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-1.jpg",
    "google pixel 8 pro": "https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-pro-1.jpg",
    "oneplus 12": "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12-1.jpg",
    "oneplus nord 4": "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-nord-4-1.jpg",
    "usb-c fast charger 65w": "https://images.unsplash.com/photo-1621962701941-8b3f3a4a9a6c?auto=format&fit=crop&w=900&q=80",
    "magsafe wireless charger": "https://images.unsplash.com/photo-1618577608401-623b2a65a868?auto=format&fit=crop&w=900&q=80",
    "wireless earbuds pro": "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
    "clear phone case": "https://images.unsplash.com/photo-1603313011106-4f36696af89d?auto=format&fit=crop&w=900&q=80",
    "tempered glass protector": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=900&q=80",
    "galaxy watch 6": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-watch6-1.jpg",
    "apple watch series 9": "https://fdn2.gsmarena.com/vv/pics/apple/apple-watch-series-9-1.jpg",
  };
  if (photos[lower]) return photos[lower];
  if (category === "Chargers") return photos["usb-c fast charger 65w"];
  if (category === "Earbuds") return photos["wireless earbuds pro"];
  if (category === "Cases") return photos["clear phone case"];
  if (category === "Accessories") return photos["tempered glass protector"];
  if (category === "Smartwatches") return photos["galaxy watch 6"];
  if (lower.includes("ultra")) return photos["samsung galaxy s24 ultra"];
  if (category === "iPhone" && lower.includes("pro")) return photos["iphone 16 pro 256gb"];
  if (category === "iPhone") return photos["iphone 15 128gb"];
  if (category === "Samsung Galaxy") return photos["samsung galaxy s24"];
  if (category === "Xiaomi") return photos["xiaomi 14"];
  if (category === "Google Pixel") return photos["google pixel 8"];
  if (category === "OnePlus") return photos["oneplus 12"];
  return photos["iphone 15 128gb"];
}
