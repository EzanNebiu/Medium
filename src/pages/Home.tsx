import { Apple, ArrowRight, AtSign, BadgePercent, Camera, Clock, Cpu, Headphones, MapPin, MessageCircle, PhoneCall, PlugZap, Shield, ShieldCheck, ShoppingBag, Smartphone, Truck, WalletCards, Watch, Wrench, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/products/ProductCard";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { categories, seedProducts } from "../data/seedProducts";
import { sqCategory } from "../lib/albanian";
import { storeWhatsAppUrl, WHATSAPP_DISPLAY_NUMBER } from "../lib/whatsapp";

const trust = [
  ["Dërgesë e shpejtë në Kosovë", Truck],
  ["Produkte origjinale", ShieldCheck],
  ["Garanci e përfshirë", Wrench],
  ["Porosi përmes WhatsApp", WalletCards],
  ["Mbështetje për klientë", PhoneCall],
];

const dealSlides: Array<{ title: string; text: string; icon: typeof Smartphone; cta: string }> = [
  {
    title: "Oferta sezonale për telefona",
    text: "Modele iPhone dhe Samsung në fokus, me çmime promocionale dhe konfirmim direkt në WhatsApp.",
    icon: BadgePercent,
    cta: "Pyet për ofertat",
  },
  {
    title: "Aksesorë për çdo blerje",
    text: "Mbushës, këllëfë, kufje dhe xhama mbrojtës me cilësi të garantuar për përdorim të përditshëm.",
    icon: PlugZap,
    cta: "Rezervo aksesorë",
  },
  {
    title: "Servisim dhe dekodim",
    text: "Shërbime për telefona, ndërrim ekranesh dhe ndihmë teknike në dyqan në Prizren.",
    icon: Wrench,
    cta: "Kërko servis",
  },
  {
    title: "Black Friday style deals",
    text: "Fushata me zbritje të mëdha dhe produkte të zgjedhura, bazuar në stilin e postimeve të dyqanit.",
    icon: ShoppingBag,
    cta: "Shiko çfarë ka sot",
  },
];

const services: Array<[string, string, typeof Smartphone]> = [
  ["Shitje telefonash", "Telefona të rinj dhe modele të kërkuara nga Apple, Samsung, Xiaomi dhe më shumë.", Smartphone],
  ["Servisim", "Riparim, kontroll teknik dhe ndërrim pjesësh për telefona.", Wrench],
  ["Dekodim", "Ndihmë për dekodim dhe konfigurim të pajisjeve.", ShieldCheck],
  ["Aksesorë", "Mbushës, kufje, këllëfë dhe xhama mbrojtës me cilësi të garantuar.", Headphones],
];

const categoryVisuals: Record<string, { Icon: typeof Smartphone; label: string; className: string }> = {
  iPhone: { Icon: Apple, label: "iOS", className: "bg-slate-950 text-white" },
  "Samsung Galaxy": { Icon: Smartphone, label: "Galaxy", className: "bg-blue-50 text-blue-700" },
  Xiaomi: { Icon: Zap, label: "Mi", className: "bg-orange-50 text-orange-700" },
  "Google Pixel": { Icon: Camera, label: "Pixel", className: "bg-green-50 text-green-700" },
  OnePlus: { Icon: Cpu, label: "1+", className: "bg-red-50 text-red-700" },
  Accessories: { Icon: Shield, label: "Aks", className: "bg-slate-100 text-slate-800" },
  Chargers: { Icon: PlugZap, label: "65W", className: "bg-orange-50 text-primary" },
  Cases: { Icon: ShieldCheck, label: "Case", className: "bg-zinc-100 text-zinc-800" },
  Earbuds: { Icon: Headphones, label: "Audio", className: "bg-purple-50 text-purple-700" },
  Smartwatches: { Icon: Watch, label: "Watch", className: "bg-cyan-50 text-cyan-700" },
};

export default function Home() {
  const featured = seedProducts.filter((product) => product.is_featured).slice(0, 4);
  const arrivals = [...seedProducts].slice(4, 8);

  return (
    <div>
      <section className="bg-white">
        <div className="container-page grid gap-8 py-6 md:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-5 pt-2 lg:sticky lg:top-6 lg:pt-6">
            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-primary">Java e ofertave Medium Mobil Shop</span>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">Telefona flagship, garanci zyrtare, çmime të qarta.</h1>
            <p className="max-w-xl text-lg text-muted-foreground">Bli iPhone, Samsung Galaxy, Pixel, Xiaomi, OnePlus dhe aksesorë me dërgesë të shpejtë në gjithë Kosovën.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products"><Button size="lg">Shfleto ofertat <ArrowRight className="h-5 w-5" /></Button></Link>
              <a href={storeWhatsAppUrl("Përshëndetje, dua të pyes për ofertat aktuale të Medium Mobil Shop.")} target="_blank" rel="noreferrer"><Button size="lg" variant="outline"><MessageCircle className="h-5 w-5" /> WhatsApp</Button></a>
            </div>
            <div className="grid gap-2 pt-2 text-sm font-semibold text-slate-700 sm:grid-cols-2">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Prizren, Kosovë</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Hënë - Shtunë, 09:00 - 20:00</span>
              <a className="flex items-center gap-2 hover:text-primary" href="https://www.instagram.com/mobilshopmediumprizren/" target="_blank" rel="noreferrer"><AtSign className="h-4 w-4 text-primary" /> @mobilshopmediumprizren</a>
              <span className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-primary" /> {WHATSAPP_DISPLAY_NUMBER}</span>
            </div>
          </div>
          <div className="lg:max-h-[calc(100vh-235px)] lg:overflow-y-auto lg:pr-2 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary))_hsl(var(--muted))]">
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
              {seedProducts.slice(1, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
            const Icon = deal.icon;
            return (
              <Card key={deal.title} className="min-w-[280px] snap-start p-5 sm:min-w-[370px]">
                <div className="flex h-full flex-col">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-orange-50 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-black">{deal.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{deal.text}</p>
                  <a className="mt-5 inline-flex text-sm font-black text-primary" href={storeWhatsAppUrl(`Përshëndetje, dua më shumë informata: ${deal.title}`)} target="_blank" rel="noreferrer">
                    {deal.cta} <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container-page grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-4">
        {services.map(([title, text, Icon]) => (
          <Card key={title as string} className="p-5">
            <Icon className="h-7 w-7 text-primary" />
            <h3 className="mt-4 font-black">{title as string}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text as string}</p>
          </Card>
        ))}
      </section>

      <section className="container-page py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black">Produktet e veçuara</h2>
          <Link className="text-sm font-bold text-primary" to="/products">Shiko të gjitha</Link>
        </div>
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container-page grid gap-6 py-8 lg:grid-cols-2">
        <Card className="bg-slate-950 p-8 text-white">
          <h2 className="text-3xl font-black">Oferta speciale</h2>
          <p className="mt-2 text-slate-300">Kombino telefonin me mbushës, këllëf dhe kufje për çmim më të mirë në fund.</p>
          <Link to="/products"><Button className="mt-6 bg-white text-slate-950 hover:bg-slate-100">Shfleto ofertat</Button></Link>
        </Card>
        <Card className="p-8">
          <h2 className="text-3xl font-black">Brendet më të kërkuara</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Apple", "Samsung", "Xiaomi", "Google", "OnePlus", "Medium Mobil"].map((brand) => (
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

      <section className="container-page py-8">
        <h2 className="mb-5 text-2xl font-black">Bli sipas kategorisë</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const visual = categoryVisuals[category] ?? categoryVisuals.Accessories;
            const Icon = visual.Icon;
            return (
              <Link key={category} to={`/products?category=${encodeURIComponent(category)}`}>
                <Card className="group flex h-28 items-center justify-between gap-4 p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                  <div className="min-w-0">
                    <span className="block font-black leading-tight">{sqCategory(category)}</span>
                    <span className="mt-1 block text-xs font-bold text-muted-foreground">{visual.label}</span>
                  </div>
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${visual.className}`}>
                    <Icon className="h-6 w-6 transition group-hover:scale-110" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
