import { ArrowRight, AtSign, BadgePercent, Clock, Headphones, MapPin, MessageCircle, PhoneCall, PlugZap, Shield, ShieldCheck, ShoppingBag, Smartphone, Truck, WalletCards, Watch, Wrench } from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { SiApple, SiGoogle, SiOneplus, SiSamsung, SiXiaomi } from "react-icons/si";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/products/ProductCard";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ProductImage } from "../components/ui/ProductImage";
import { categories, seedProducts } from "../data/seedProducts";
import { sqCategory } from "../lib/albanian";
import { storeWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from "../lib/whatsapp";
import { getProducts } from "../services/products";
import { defaultHomepageContent, getHomepageContent } from "../services/siteContent";
import type { Product } from "../types/product";
import type { HomepageContent, SiteIconKey } from "../types/siteContent";

const trust = [
  ["Dërgesë e shpejtë në Kosovë", Truck],
  ["Produkte origjinale", ShieldCheck],
  ["Garanci e përfshirë", Wrench],
  ["Porosi përmes WhatsApp", WalletCards],
  ["Mbështetje për klientë", PhoneCall],
];

type IconComponent = ComponentType<{ className?: string }>;

const contentIcons: Record<SiteIconKey, IconComponent> = {
  smartphone: Smartphone,
  wrench: Wrench,
  shield: ShieldCheck,
  headphones: Headphones,
  plug: PlugZap,
  badge: BadgePercent,
  shopping: ShoppingBag,
};

const categoryVisuals: Record<string, { Icon: IconComponent; label: string; className: string }> = {
  iPhone: { Icon: SiApple, label: "iOS", className: "bg-slate-950 text-white" },
  "Samsung Galaxy": { Icon: SiSamsung, label: "Galaxy", className: "bg-blue-50 text-blue-700" },
  Xiaomi: { Icon: SiXiaomi, label: "Mi", className: "bg-orange-50 text-orange-700" },
  "Google Pixel": { Icon: SiGoogle, label: "Pixel", className: "bg-green-50 text-green-700" },
  OnePlus: { Icon: SiOneplus, label: "1+", className: "bg-red-50 text-red-700" },
  Accessories: { Icon: Shield, label: "Aks", className: "bg-slate-100 text-slate-800" },
  Chargers: { Icon: PlugZap, label: "65W", className: "bg-orange-50 text-primary" },
  Cases: { Icon: ShieldCheck, label: "Case", className: "bg-zinc-100 text-zinc-800" },
  Earbuds: { Icon: Headphones, label: "Audio", className: "bg-purple-50 text-purple-700" },
  Smartwatches: { Icon: Watch, label: "Watch", className: "bg-cyan-50 text-cyan-700" },
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    void Promise.all([getProducts(), getHomepageContent()]).then(([nextProducts, nextContent]) => {
      setProducts(nextProducts);
      setContent(nextContent);
    });
  }, []);

  const heroProducts = useMemo(() => {
    // Whitelist of allowed hero product image URLs
    const allowedHeroImages = [
      "https://qvsjjcrwrzhjtljredzq.supabase.co/storage/v1/object/public/product-images/android-tablet/f934d6c4-83cf-4e10-9b25-1ef3009fd2a7.png",
      "https://qvsjjcrwrzhjtljredzq.supabase.co/storage/v1/object/public/product-images/galaxy-a57-5g/f9f5d4a8-332f-4f53-bf4e-ab2d4eb59436.png",
      "https://qvsjjcrwrzhjtljredzq.supabase.co/storage/v1/object/public/product-images/dji-osmo/176fcb66-c65c-4637-bebb-460fa94f077f.png",
    ];
    
    const filtered = products.filter((product) => 
      allowedHeroImages.includes(product.main_image_url) || 
      product.name.toLowerCase().includes("iphone air")
    );
    
    // If no whitelisted products found, exclude gsmarena images from fallback
    if (filtered.length === 0) {
      return products.filter((product) => product.main_image_url && !product.main_image_url.includes("gsmarena.com")).slice(0, 5);
    }
    
    return filtered;
  }, [products]);

  const heroProduct = useMemo(() => heroProducts[currentSlide] ?? heroProducts[0] ?? products[0] ?? seedProducts[1], [heroProducts, currentSlide, products]);
  const featured = useMemo(() => pickProducts(products, content.featuredProductIds, products.filter((product) => product.is_featured).slice(0, 4)), [content.featuredProductIds, products]);
  const arrivals = useMemo(() => pickProducts(products, content.newArrivalProductIds, products.slice(4, 8)), [content.newArrivalProductIds, products]);
  const dealSlides = useMemo(() => content.dealBanners.filter((deal) => deal.active).sort((a, b) => a.sort_order - b.sort_order), [content.dealBanners]);
  const services = useMemo(() => content.services.filter((service) => service.active).sort((a, b) => a.sort_order - b.sort_order), [content.services]);

  // Auto-rotate carousel
  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, [heroProducts.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);

  return (
    <div>
      <section className="bg-[#211d22] text-white">
        <div className="container-page grid min-h-[auto] items-center gap-8 py-10 sm:min-h-[560px] sm:gap-10 sm:py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="text-xl font-black text-white/35 sm:text-2xl">{content.heroBadge}</span>
            <h1 className="mt-5 max-w-3xl text-4xl font-light leading-none tracking-tight sm:mt-7 sm:text-5xl md:text-7xl">
              {content.heroTitle} <span className="font-black">{content.heroHighlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-300">{content.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products"><Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-black">Shfleto tani</Button></Link>
              <a href={storeWhatsAppUrl("Përshëndetje, dua të pyes për ofertat aktuale të Medium Mobil Shop.")} target="_blank" rel="noreferrer"><Button size="lg" variant="secondary"><MessageCircle className="h-5 w-5" /> WhatsApp</Button></a>
            </div>
            <div className="mt-8 grid gap-2 text-sm font-semibold text-zinc-300 sm:grid-cols-2">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Prizren, Kosovë</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Hënë - Shtunë, 09:00 - 20:00</span>
              <a className="flex items-center gap-2 hover:text-primary" href="https://www.instagram.com/mobilshopmediumprizren/" target="_blank" rel="noreferrer"><AtSign className="h-4 w-4 text-primary" /> @mobilshopmediumprizren</a>
              <span className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-primary" /> {WHATSAPP_DISPLAY_NUMBER}</span>
            </div>
          </div>
          <div className="relative min-h-[250px] overflow-hidden sm:min-h-[360px]">
            <div className="absolute inset-x-10 bottom-0 h-28 rounded-[50%] bg-primary/25 blur-3xl" />
            {heroProduct && <ProductImage priority className="relative mx-auto h-[270px] w-full max-w-[620px] bg-transparent object-contain drop-shadow-2xl sm:h-[360px] md:h-[420px]" src={heroProduct.main_image_url} alt={heroProduct.name} seed={heroProduct.name} />}
            
            {heroProducts.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {heroProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-3 py-8 md:grid-cols-5">
        {trust.map(([label, Icon]) => (
          <Card key={label as string} className="flex items-center gap-3 p-4">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold">{label as string}</span>
          </Card>
        ))}
      </section>

      <section className="container-page py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-sm font-black uppercase tracking-wide text-primary">Oferta dhe shërbime</span>
            <h2 className="mt-1 text-2xl font-black">Çfarë promovon dyqani</h2>
          </div>
          <a href={storeWhatsAppUrl()} target="_blank" rel="noreferrer">
            <Button variant="outline"><MessageCircle className="h-4 w-4" /> Kontakto në WhatsApp</Button>
          </a>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary))_hsl(var(--muted))]">
          {dealSlides.map((deal) => {
            const Icon = contentIcons[deal.icon] ?? BadgePercent;
            return (
              <Card key={deal.title} className="min-w-[280px] snap-start p-5 sm:min-w-[370px]">
                <div className="flex h-full flex-col">
                  {deal.image_url && <ProductImage className="mb-4 h-48 w-full rounded-md object-cover" src={deal.image_url} alt={deal.title} seed={deal.title} />}
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-orange-50 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-black">{deal.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{deal.text}</p>
                  <DealCta href={deal.href} label={deal.cta} />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="sherbime" className="container-page grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => {
          const Icon = contentIcons[service.icon] ?? Wrench;
          return (
          <Card key={service.id} className="p-5">
            <Icon className="h-7 w-7 text-primary" />
            <h3 className="mt-4 font-black">{service.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.text}</p>
          </Card>
          );
        })}
      </section>

      <section className="container-page py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Produktet e veçuara</h2>
          <Link className="text-sm font-bold text-primary" to="/products">Shiko të gjitha</Link>
        </div>
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container-page grid gap-6 py-8 lg:grid-cols-2">
        <Card className="bg-slate-950 p-8 text-white">
          <h2 className="text-3xl font-black">{content.specialOfferTitle}</h2>
          <p className="mt-2 text-slate-300">{content.specialOfferText}</p>
          <Link to="/products"><Button className="mt-6 bg-white text-slate-950 hover:bg-slate-100">Shfleto ofertat</Button></Link>
        </Card>
        <Card className="p-8">
          <h2 className="text-3xl font-black">Brendet më të kërkuara</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {content.brandFilters.map((brand) => (
              <Link key={brand} to={`/products?brand=${brand}`} className="rounded-full border px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary">{brand}</Link>
            ))}
          </div>
        </Card>
      </section>

      <section className="container-page py-8">
        <h2 className="mb-5 text-2xl font-black">Produktet më të reja</h2>
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {arrivals.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container-page section-air">
        <h2 className="mb-5 text-2xl font-black">Bli sipas kategorisë</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const visual = categoryVisuals[category] ?? categoryVisuals.Accessories;
            const Icon = visual.Icon;
            return (
              <Link key={category} to={`/products?category=${encodeURIComponent(category)}`}>
                <Card className="group flex h-36 flex-col items-center justify-center gap-3 border-0 bg-zinc-100 p-4 text-center transition hover:-translate-y-0.5 hover:bg-orange-50">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${visual.className}`}>
                    <Icon className="h-6 w-6 transition group-hover:scale-110" />
                  </span>
                  <div className="min-w-0">
                    <span className="block font-black leading-tight">{sqCategory(category)}</span>
                    <span className="mt-1 block text-xs font-bold text-muted-foreground">{visual.label}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function pickProducts(products: Product[], selectedIds: string[], fallback: Product[]) {
  const selected = selectedIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  return selected.length ? selected.slice(0, 8) : fallback;
}

function DealCta({ href, label }: { href: string; label: string }) {
  const target = href || "/products";
  const className = "mt-5 inline-flex text-sm font-black text-primary";
  const content = <>{label} <ArrowRight className="ml-1 h-4 w-4" /></>;
  if (/^https?:\/\//i.test(target)) {
    return <a className={className} href={target} target="_blank" rel="noreferrer">{content}</a>;
  }
  return <Link className={className} to={target}>{content}</Link>;
}
