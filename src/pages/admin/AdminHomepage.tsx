import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ProductImage } from "../../components/ui/ProductImage";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { showToast } from "../../components/ui/toast";
import { uploadProductImage } from "../../services/storage";
import { getAdminProducts } from "../../services/products";
import { defaultHomepageContent, getHomepageContent, makeDeal, makeService, saveHomepageContent } from "../../services/siteContent";
import type { Product } from "../../types/product";
import type { HomepageContent, SiteDealBanner, SiteIconKey, SiteService } from "../../types/siteContent";

const iconOptions: Array<[SiteIconKey, string]> = [
  ["smartphone", "Telefon"],
  ["wrench", "Servis / riparim"],
  ["shield", "Garanci / mbrojtje"],
  ["headphones", "Aksesorë audio"],
  ["plug", "Mbushës"],
  ["badge", "Zbritje / ofertë"],
  ["shopping", "Pako produktesh"],
];

export default function AdminHomepage() {
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const sortedProducts = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);

  useEffect(() => {
    void Promise.all([getHomepageContent(), getAdminProducts()]).then(([nextContent, nextProducts]) => {
      setContent(nextContent);
      setProducts(nextProducts);
      setLoading(false);
    });
  }, []);

  const setField = <K extends keyof HomepageContent>(key: K, value: HomepageContent[K]) => {
    setContent((current) => ({ ...current, [key]: value }));
  };

  const updateService = (id: string, patch: Partial<SiteService>) => {
    setField("services", content.services.map((service) => service.id === id ? { ...service, ...patch } : service));
  };

  const updateDeal = (id: string, patch: Partial<SiteDealBanner>) => {
    setField("dealBanners", content.dealBanners.map((deal) => deal.id === id ? { ...deal, ...patch } : deal));
  };

  const uploadDealBanner = async (id: string, file?: File) => {
    if (!file) return;
    try {
      const imageUrl = await uploadProductImage(file, `deal-${id}`);
      updateDeal(id, { image_url: imageUrl });
      showToast("Banneri i ofertës u ngarkua");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Ngarkimi i bannerit dështoi", "error");
    }
  };

  const uploadHeroAdvert = async (file?: File) => {
    if (!file) return;
    try {
      const imageUrl = await uploadProductImage(file, `hero-advert-${Date.now()}`);
      setField("heroAdvertImage", imageUrl);
      showToast("Foto e reklamës u ngarkua");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Ngarkimi i fotos dështoi", "error");
    }
  };

  const save = async () => {
    setSaving(true);
    const { error } = await saveHomepageContent(content);
    setSaving(false);
    if (error) {
      showToast("U ruajt lokalisht, por tabela site_content mungon ose RLS e bllokoi ruajtjen në Supabase.", "error");
      return;
    }
    showToast("Faqja kryesore u përditësua");
  };

  if (loading) return <Card className="p-6 text-sm font-semibold text-muted-foreground">Konfigurimi po ngarkohet...</Card>;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black">Faqja kryesore</h1>
          <p className="text-muted-foreground">Ndrysho shërbimet, bannerat e ofertave dhe produktet që shfaqen në ballinë.</p>
        </div>
        <Button onClick={() => void save()} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Po ruhet..." : "Ruaj ndryshimet"}</Button>
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="text-xl font-black">Hero banner</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Teksti i vogël"><Input value={content.heroBadge} onChange={(e) => setField("heroBadge", e.target.value)} /></Field>
          <Field label="Produkti në hero">
            <Select value={content.heroProductId} onChange={(e) => setField("heroProductId", e.target.value)}>
              {sortedProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </Select>
          </Field>
          <Field label="Titulli"><Input value={content.heroTitle} onChange={(e) => setField("heroTitle", e.target.value)} /></Field>
          <Field label="Fjala e theksuar"><Input value={content.heroHighlight} onChange={(e) => setField("heroHighlight", e.target.value)} /></Field>
        </div>
        <Field label="Përshkrimi në hero">
          <textarea className="min-h-24 w-full rounded-md border p-3 text-sm" value={content.heroText} onChange={(e) => setField("heroText", e.target.value)} />
        </Field>
        <div className="space-y-3 rounded-lg border bg-orange-50/60 p-4">
          <h3 className="text-sm font-black uppercase text-primary">Foto e reklamës në hero</h3>
          <p className="text-sm text-muted-foreground">Ngarko një foto reklamuese që shfaqet në hero section (opsionale).</p>
          {content.heroAdvertImage && (
            <ProductImage 
              className="aspect-video w-full max-w-md rounded-md object-cover" 
              src={content.heroAdvertImage} 
              alt="Reklama e hero" 
              seed="hero-advert" 
            />
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="URL e fotos së reklamës">
              <Input value={content.heroAdvertImage} onChange={(e) => setField("heroAdvertImage", e.target.value)} placeholder="https://.../reklama.webp" />
            </Field>
            <Field label="Ngarko foto të reklamës">
              <Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void uploadHeroAdvert(e.target.files?.[0])} />
            </Field>
          </div>
        </div>
      </Card>

      <Card className="space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Shërbimet</h2>
            <p className="text-sm text-muted-foreground">Shto shërbime si ndërrim ekrani, servisim, dekodim ose aksesorë.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => setField("services", [...content.services, makeService()])}><Plus className="h-4 w-4" /> Shto shërbim</Button>
        </div>
        <div className="grid gap-4">
          {content.services.map((service) => (
            <Card key={service.id} className="space-y-3 p-4 shadow-none">
              <div className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
                <Field label="Emri i shërbimit"><Input value={service.title} onChange={(e) => updateService(service.id, { title: e.target.value })} /></Field>
                <Field label="Ikona">
                  <Select value={service.icon} onChange={(e) => updateService(service.id, { icon: e.target.value as SiteIconKey })}>
                    {iconOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </Select>
                </Field>
                <Button type="button" variant="ghost" onClick={() => setField("services", content.services.filter((item) => item.id !== service.id))}><Trash2 className="h-4 w-4" /> Hiqe</Button>
              </div>
              <Field label="Përshkrimi"><textarea className="min-h-20 w-full rounded-md border p-3 text-sm" value={service.text} onChange={(e) => updateService(service.id, { text: e.target.value })} /></Field>
              <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={service.active} onChange={(e) => updateService(service.id, { active: e.target.checked })} /> Aktiv në homepage</label>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Bannerat / slideri i ofertave</h2>
            <p className="text-sm text-muted-foreground">Ndrysho tekstin, linkun dhe foton e çdo oferte që shfaqet në slider.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => setField("dealBanners", [...content.dealBanners, makeDeal()])}><Plus className="h-4 w-4" /> Shto ofertë</Button>
        </div>
        <div className="grid gap-4">
          {content.dealBanners.map((deal) => (
            <Card key={deal.id} className="space-y-4 p-4 shadow-none">
              <div className="grid gap-4 xl:grid-cols-[160px_1fr]">
                <ProductImage className="aspect-[4/3] w-full rounded-md bg-orange-50 object-cover" src={deal.image_url} alt={deal.title} seed={deal.title} />
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Titulli i ofertës"><Input value={deal.title} onChange={(e) => updateDeal(deal.id, { title: e.target.value })} /></Field>
                    <Field label="Butoni CTA"><Input value={deal.cta} onChange={(e) => updateDeal(deal.id, { cta: e.target.value })} /></Field>
                    <Field label="Linku i ofertës"><Input value={deal.href} onChange={(e) => updateDeal(deal.id, { href: e.target.value })} placeholder="/products?category=iPhone" /></Field>
                    <Field label="Ikona">
                      <Select value={deal.icon} onChange={(e) => updateDeal(deal.id, { icon: e.target.value as SiteIconKey })}>
                        {iconOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </Select>
                    </Field>
                  </div>
                  <Field label="Përshkrimi"><textarea className="min-h-20 w-full rounded-md border p-3 text-sm" value={deal.text} onChange={(e) => updateDeal(deal.id, { text: e.target.value })} /></Field>
                  <div className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
                    <Field label="URL e fotos së bannerit"><Input value={deal.image_url} onChange={(e) => updateDeal(deal.id, { image_url: e.target.value })} placeholder="https://.../banner.webp" /></Field>
                    <Field label="Ngarko banner"><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void uploadDealBanner(deal.id, e.target.files?.[0])} /></Field>
                    <Button type="button" variant="ghost" onClick={() => setField("dealBanners", content.dealBanners.filter((item) => item.id !== deal.id))}><Trash2 className="h-4 w-4" /> Hiqe</Button>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={deal.active} onChange={(e) => updateDeal(deal.id, { active: e.target.checked })} /> Aktiv në slider</label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="space-y-5 p-5">
        <h2 className="text-xl font-black">Produktet në homepage</h2>
        <div className="grid gap-6 xl:grid-cols-2">
          <ProductPicker title="Produktet e veçuara" products={sortedProducts} selectedIds={content.featuredProductIds} onChange={(ids) => setField("featuredProductIds", ids)} />
          <ProductPicker title="Produktet më të reja" products={sortedProducts} selectedIds={content.newArrivalProductIds} onChange={(ids) => setField("newArrivalProductIds", ids)} />
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="text-xl font-black">Oferta speciale dhe brendet</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Titulli i ofertës speciale"><Input value={content.specialOfferTitle} onChange={(e) => setField("specialOfferTitle", e.target.value)} /></Field>
          <Field label="Brendet e shfaqura" help="Ndaji me presje, p.sh. Apple, Samsung, Xiaomi">
            <Input value={content.brandFilters.join(", ")} onChange={(e) => setField("brandFilters", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))} />
          </Field>
        </div>
        <Field label="Përshkrimi i ofertës speciale">
          <textarea className="min-h-20 w-full rounded-md border p-3 text-sm" value={content.specialOfferText} onChange={(e) => setField("specialOfferText", e.target.value)} />
        </Field>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => void save()} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Po ruhet..." : "Ruaj ndryshimet"}</Button>
      </div>
    </section>
  );
}

function ProductPicker({ title, products, selectedIds, onChange }: { title: string; products: Product[]; selectedIds: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  };

  return (
    <div>
      <h3 className="font-black">{title}</h3>
      <p className="mb-3 text-sm text-muted-foreground">Zgjidh produktet që do të shfaqen në këtë seksion.</p>
      <div className="max-h-[430px] space-y-2 overflow-auto rounded-lg border bg-slate-50 p-2">
        {products.map((product) => (
          <label key={product.id} className="flex items-center gap-3 rounded-md bg-white p-2 text-sm">
            <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggle(product.id)} />
            <ProductImage className="h-12 w-12 rounded object-contain p-1" src={product.main_image_url} alt={product.name} seed={product.name} />
            <span className="min-w-0 flex-1">
              <strong className="block truncate">{product.name}</strong>
              <span className="text-xs text-muted-foreground">{product.brand}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-sm font-black text-slate-950">{label}</div>
      <div className="mt-2">{children}</div>
      {help && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{help}</p>}
    </div>
  );
}
