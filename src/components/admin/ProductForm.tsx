import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, Link2, Search, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { ProductImage } from "../ui/ProductImage";
import { Select } from "../ui/select";
import { showToast } from "../ui/toast";
import { usePhoneImport } from "../../hooks/usePhoneImport";
import { calculateDiscount, safeImage, slugify } from "../../lib/utils";
import { fetchPhoneSpecs } from "../../services/phoneSpecs";
import { saveProduct } from "../../services/products";
import { uploadProductImage } from "../../services/storage";
import type { Product, ProductSpecs } from "../../types/product";
import { translateSpecsToAlbanian } from "../../lib/albanian";

const emptySpecs: ProductSpecs = {
  display: "",
  processor: "",
  ram: "",
  storage: "",
  rear_camera: "",
  front_camera: "",
  battery: "",
  charging: "",
  operating_system: "",
  network: "",
  sim: "",
  dimensions: "",
  weight: "",
  colors: "",
  release_date: "",
  full_specs: {},
};

const specLabels: Record<string, string> = {
  display: "Ekrani",
  processor: "Procesori",
  ram: "RAM",
  storage: "Memoria",
  rear_camera: "Kamera e pasme",
  front_camera: "Kamera e përparme",
  battery: "Bateria",
  charging: "Mbushja",
  operating_system: "Sistemi operativ",
  network: "Rrjeti",
  sim: "SIM",
  dimensions: "Dimensionet",
  weight: "Pesha",
  colors: "Ngjyrat",
  release_date: "Data e lansimit",
};

type ProductFormState = {
  name: string;
  brand: string;
  price: number;
  oldPrice: number;
  stock: number;
  warranty: number;
  delivery: string;
  condition: Product["condition"];
  featured: boolean;
  active: boolean;
  image: string;
  gallery: string;
  description: string;
  supplierNotes: string;
  specs: ProductSpecs;
  imported: boolean;
  apiDeviceId?: string;
};

export function ProductForm({ initial }: { initial?: Partial<Product> }) {
  const navigate = useNavigate();
  const importer = usePhoneImport();
  const [preview, setPreview] = useState(false);
  const [selectedImportLoading, setSelectedImportLoading] = useState(false);
  const [imageLink, setImageLink] = useState("");
  const [form, setForm] = useState<ProductFormState>({
    name: initial?.name ?? "",
    brand: initial?.brand ?? "",
    price: initial?.price ?? 0,
    oldPrice: initial?.old_price ?? 0,
    stock: initial?.stock_quantity ?? 10,
    warranty: initial?.warranty_months ?? 24,
    delivery: initial?.delivery_badge ?? "24h delivery",
    condition: initial?.condition ?? "new",
    featured: initial?.is_featured ?? false,
    active: initial?.is_active ?? true,
    image: initial?.main_image_url ?? "",
    gallery: initial?.gallery_images?.join("\n") ?? "",
    description: initial?.full_description ?? "",
    supplierNotes: "",
    specs: initial?.specs ?? emptySpecs,
    imported: initial?.imported_from_api ?? false,
  });

  const canSave = useMemo(() => Boolean(form.name && form.brand && form.price > 0), [form.name, form.brand, form.price]);
  const galleryImages = useMemo(() => parseImageLinks(form.gallery), [form.gallery]);
  const allImageLinks = useMemo(() => uniqueImageLinks([form.image, ...galleryImages]), [form.image, galleryImages]);
  const setField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setSpec = (key: keyof ProductSpecs, value: string) => setForm((current) => ({ ...current, specs: { ...current.specs, [key]: value } }));
  const setGalleryImages = (images: string[]) => setField("gallery", uniqueImageLinks(images).join("\n"));

  const uploadMainImage = async (file?: File) => {
    if (!file) return;
    try {
      const imageUrl = await uploadProductImage(file, form.name || file.name);
      setField("image", imageUrl);
      showToast("Fotoja kryesore e produktit u ngarkua");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Ngarkimi i fotos dështoi", "error");
    }
  };

  const uploadGalleryImages = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadProductImage(file, form.name || file.name)));
      setGalleryImages([...galleryImages, ...uploaded]);
      showToast(`${uploaded.length} foto ${uploaded.length === 1 ? "u shtua" : "u shtuan"} në galeri`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Ngarkimi i galerisë dështoi", "error");
    }
  };

  const addImageLink = () => {
    const link = imageLink.trim();
    if (!/^https?:\/\//i.test(link)) {
      showToast("Vendos një link të vlefshëm që fillon me http ose https.", "error");
      return;
    }
    setGalleryImages([...galleryImages, link]);
    if (!form.image) setField("image", link);
    setImageLink("");
    showToast("Linku i fotos u shtua");
  };

  const removeGalleryImage = (image: string) => {
    const nextGallery = galleryImages.filter((item) => item !== image);
    setGalleryImages(nextGallery);
    if (form.image === image) setField("image", nextGallery[0] ?? "");
  };

  const selectMatch = async (index: number) => {
    const match = importer.matches[index];
    setSelectedImportLoading(true);
    let selectedMatch = match;
    if (!match.specs || !match.images?.length) {
      try {
        const detailed = await fetchPhoneSpecs(match.deviceId || match.name);
        selectedMatch = detailed.matches[0] ?? match;
      } catch {
        selectedMatch = match;
      }
    }
    applyImportedMatch(selectedMatch);
    importer.setSelected(selectedMatch);
    setSelectedImportLoading(false);
  };

  const applyImportedMatch = (match: typeof importer.matches[number]) => {
    const images = uniqueImageLinks([match.thumbnail, ...(match.images ?? [])]);
    setForm((current) => ({
      ...current,
      name: match.name,
      brand: match.brand,
      image: images[0] || "",
      gallery: images.join("\n"),
      specs: match.specs ? translateSpecsToAlbanian(match.specs) : current.specs,
      imported: true,
      apiDeviceId: match.deviceId,
      description: `${match.name} u importua nga RapidAPI. Specifikat e importuara duhet të kontrollohen para publikimit.`,
    }));
    showToast("Të dhënat e telefonit u plotësuan. Kontrollo specifikat dhe fotot para publikimit.");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!preview) {
      setPreview(true);
      return;
    }
    const payload: Partial<Product> = {
      id: initial?.id,
      name: form.name,
      slug: slugify(form.name),
      brand: form.brand,
      category: "Phones",
      price: form.price,
      old_price: form.oldPrice || null,
      discount_percentage: calculateDiscount(form.price, form.oldPrice),
      stock_quantity: form.stock,
      condition: form.condition,
      warranty_months: form.warranty,
      delivery_badge: form.delivery,
      is_featured: form.featured,
      is_active: form.active,
      main_image_url: form.image || safeImage(form.name),
      gallery_images: galleryImages,
      short_description: form.description.slice(0, 140),
      full_description: form.description,
      imported_from_api: form.imported,
      api_source: form.imported ? "mobile-phone-specs-database" : null,
      api_device_id: form.apiDeviceId ?? null,
      specs: form.specs,
    };
    const { error } = await saveProduct(payload);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Produkti u ruajt");
    navigate("/admin/products");
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-6">
      <Card className="p-5">
        <h2 className="text-xl font-black">Kërko modelin {"->"} zgjidh përputhjen {"->"} kontrollo specifikat/fotot {"->"} shto çmimin/stokun {"->"} publiko</h2>
        <p className="mt-2 text-sm text-amber-700">Specifikat e importuara duhet të kontrollohen para publikimit.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <Field label="Kërko brend/model" help="Shkruaj modelin ose custom ID nga API.">
            <Input value={importer.query} onChange={(e) => importer.setQuery(e.target.value)} placeholder="iPhone 16 Pro, Samsung Galaxy S24 Ultra..." />
          </Field>
          <Button type="button" className="h-11" disabled={importer.loading || selectedImportLoading} onClick={() => void importer.search()}><Search className="h-4 w-4" /> {importer.loading ? "Po merret..." : "Merr të dhënat"}</Button>
        </div>
        {importer.error && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{importer.error}. Mund ta krijosh produktin manualisht.</p>}
        {importer.matches.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {importer.matches.map((match, index) => (
              <button type="button" disabled={selectedImportLoading} key={match.deviceId} onClick={() => void selectMatch(index)} className={`rounded-lg border bg-white p-3 text-left hover:border-primary disabled:cursor-wait disabled:opacity-70 ${importer.selected?.deviceId === match.deviceId ? "border-primary" : ""}`}>
                <ProductImage className="mb-3 aspect-square w-full rounded-md object-contain p-3" src={match.thumbnail || safeImage(match.name)} alt={match.name} seed={match.name} />
                <strong>{match.name}</strong>
                <p className="text-sm text-muted-foreground">{match.brand} {match.releaseYear}</p>
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="space-y-4 p-5">
          <h2 className="text-xl font-black">Detajet e produktit</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Emri i produktit"><Input value={form.name} onChange={(e) => setField("name", e.target.value)} /></Field>
            <Field label="Brendi"><Input value={form.brand} onChange={(e) => setField("brand", e.target.value)} /></Field>
            <Field label="Çmimi i shitjes"><Input type="number" value={form.price} onChange={(e) => setField("price", Number(e.target.value))} /></Field>
            <Field label="Çmimi i vjetër"><Input type="number" value={form.oldPrice} onChange={(e) => setField("oldPrice", Number(e.target.value))} /></Field>
            <Field label="Sasia në stok"><Input type="number" value={form.stock} onChange={(e) => setField("stock", Number(e.target.value))} /></Field>
            <Field label="Vlera e zbritjes"><Input type="number" value={Math.max(0, form.oldPrice - form.price)} readOnly /></Field>
            <Field label="Garancia"><Select value={form.warranty} onChange={(e) => setField("warranty", Number(e.target.value))}><option value={12}>12 muaj</option><option value={24}>24 muaj</option><option value={36}>36 muaj</option></Select></Field>
            <Field label="Dërgesa"><Select value={form.delivery} onChange={(e) => setField("delivery", e.target.value)}><option value="24h delivery">Dërgesë 24h</option><option value="Fast delivery">Dërgesë e shpejtë</option><option value="Pre-order">Porosi paraprake</option></Select></Field>
            <Field label="Gjendja"><Select value={form.condition} onChange={(e) => setField("condition", e.target.value as Product["condition"])}><option value="new">I ri</option><option value="open-box">Paketim i hapur</option><option value="refurbished">I rinovuar</option></Select></Field>
            <Field label="Foto kryesore URL" help="Mund të jetë link nga API, link i jashtëm ose upload."><Input value={form.image} onChange={(e) => setField("image", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 rounded-lg border bg-orange-50/60 p-4 md:grid-cols-2">
            <Field label="Ngarko foton kryesore" help="Zëvendëson foton kryesore me një file nga kompjuteri.">
              <Input className="bg-white" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => void uploadMainImage(e.target.files?.[0])} />
            </Field>
            <Field label="Ngarko foto të galerisë" help="Shton një ose më shumë file në galeri.">
              <Input className="bg-white" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" multiple onChange={(e) => void uploadGalleryImages(e.target.files)} />
            </Field>
          </div>
          <Card className="space-y-4 border-orange-200 bg-white p-4 shadow-none">
            <div>
              <h3 className="text-sm font-black uppercase text-primary">Fotot nga API, upload ose link</h3>
              <p className="mt-1 text-sm text-muted-foreground">Mund të zgjedhësh foton kryesore, të shtosh linke të reja ose të largosh foto nga galeria para publikimit.</p>
            </div>
            <div className="grid gap-2 lg:grid-cols-[1fr_auto] lg:items-end">
              <Field label="Shto foto me link" help="P.sh. https://.../foto-produkti.webp">
                <Input placeholder="https://.../foto-produkti.webp" value={imageLink} onChange={(e) => setImageLink(e.target.value)} />
              </Field>
              <Button type="button" className="h-11" variant="outline" onClick={addImageLink}><Link2 className="h-4 w-4" /> Shto link</Button>
            </div>
            {allImageLinks.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {allImageLinks.map((image) => (
                  <div key={image} className={`rounded-lg border bg-white p-2 ${form.image === image ? "border-primary ring-2 ring-orange-100" : ""}`}>
                    <ProductImage className="aspect-[4/3] w-full rounded-md object-contain p-2" src={image} alt={form.name || "Foto produkti"} seed={form.name || image} />
                    <div className="mt-2 grid gap-2">
                      <Button type="button" size="sm" variant={form.image === image ? "primary" : "outline"} onClick={() => setField("image", image)}>
                        {form.image === image ? "Foto kryesore" : "Bëje kryesore"}
                      </Button>
                      {galleryImages.includes(image) && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeGalleryImage(image)}>
                          <Trash2 className="h-4 w-4" /> Hiqe nga galeria
                        </Button>
                      )}
                    </div>
                    <p className="mt-2 truncate text-xs text-muted-foreground" title={image}>{image}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-md border bg-slate-50 p-4 text-sm text-muted-foreground">Ende nuk ka foto nga API ose linke të shtuara.</p>
            )}
          </Card>
          <Field label="Përshkrimi i produktit"><textarea className="min-h-28 w-full rounded-md border p-3 text-sm" value={form.description} onChange={(e) => setField("description", e.target.value)} /></Field>
          <Field label="Linket e galerisë" help="Një URL për rresht. Këto përdoren në faqen publike të produktit."><textarea className="min-h-24 w-full rounded-md border p-3 text-sm" value={form.gallery} onChange={(e) => setField("gallery", e.target.value)} /></Field>
          <Field label="Shënime për furnitorin"><textarea className="min-h-20 w-full rounded-md border p-3 text-sm" value={form.supplierNotes} onChange={(e) => setField("supplierNotes", e.target.value)} /></Field>
          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <label><input type="checkbox" checked={form.featured} onChange={(e) => setField("featured", e.target.checked)} /> Produkt i veçuar</label>
            <label><input type="checkbox" checked={form.active} onChange={(e) => setField("active", e.target.checked)} /> Aktiv</label>
          </div>
        </Card>
        <Card className="h-fit p-5 xl:sticky xl:top-32">
          <h2 className="flex items-center gap-2 text-xl font-black"><ImagePlus className="h-5 w-5" /> Pamja paraprake e produktit</h2>
          <ProductImage className="mt-4 aspect-square w-full rounded-md object-contain p-4" src={form.image || safeImage(form.name || "Medium Mobil Shop")} alt={form.name} seed={form.name || "Medium Mobil Shop"} />
          <p className="mt-4 font-black">{form.name || "Emri i produktit"}</p>
          <p className="text-sm text-muted-foreground">{form.brand || "Brendi"}</p>
          <p className="mt-2 text-2xl font-black">EUR {form.price || 0}</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-xl font-black">Specifikat e importuara dhe ndryshimet manuale</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {Object.entries(emptySpecs).filter(([key]) => key !== "full_specs").map(([key]) => (
            <Field key={key} label={specLabels[key] ?? key.replaceAll("_", " ")}>
              <Input value={String(form.specs[key as keyof ProductSpecs] ?? "")} onChange={(e) => setSpec(key as keyof ProductSpecs, e.target.value)} />
            </Field>
          ))}
        </div>
      </Card>

      {preview && <Card className="border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-900">Pamja paraprake është aktive. Kontrollo të dhënat dhe kliko përsëri Ruaj produktin për publikim.</Card>}
      <div className="flex flex-col justify-end gap-3 sm:flex-row">
        <Button type="button" className="w-full sm:w-auto" variant="outline" onClick={() => setPreview(false)}>Ndrysho</Button>
        <Button className="w-full sm:w-auto" disabled={!canSave}>{preview ? "Ruaj produktin" : "Shiko paraprakisht"}</Button>
      </div>
    </form>
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

function parseImageLinks(value: string) {
  return uniqueImageLinks(value.split(/\r?\n/));
}

function uniqueImageLinks(values: Array<string | undefined | null>) {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)));
}
