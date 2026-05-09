import { CheckCircle, HandCoins, MessageCircle, PackageCheck, Store, Truck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CartSummary } from "../components/cart/CartSummary";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { showToast } from "../components/ui/toast";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { sqDeliveryMethod, sqPayment } from "../lib/albanian";
import { formatCurrency } from "../lib/utils";
import { buildOrderWhatsAppMessage, storeWhatsAppUrl, whatsappUrl, WHATSAPP_DISPLAY_NUMBER } from "../lib/whatsapp";
import { calculateCartTotals } from "../services/cart";
import { createOrder } from "../services/orders";
import { profileToCheckoutDefaults } from "../services/profile";
import type { CheckoutForm, DeliveryMethod, PaymentMethod } from "../types/order";

const steps = ["Të dhënat e klientit", "Adresa e dërgesës", "Mënyra e pagesës", "Rishiko porosinë"];

export default function Checkout() {
  const { items, clearCart } = useCart();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [whatsAppOrderUrl, setWhatsAppOrderUrl] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutForm>({
    fullName: "",
    phone: "",
    email: user?.email ?? "",
    city: "",
    address: "",
    deliveryNotes: "",
    deliveryMethod: "delivery",
    paymentMethod: "cash",
    installmentMonths: "12",
  });
  const totals = useMemo(() => calculateCartTotals(items, form.deliveryMethod), [form.deliveryMethod, items]);
  const monthlyAmount = form.paymentMethod === "monthly" ? totals.total / Number(form.installmentMonths) : 0;

  useEffect(() => {
    const defaults = profileToCheckoutDefaults(profile, user?.email);
    setForm((current) => ({
      ...current,
      fullName: current.fullName || defaults.fullName || "",
      phone: current.phone || defaults.phone || "",
      email: current.email || defaults.email || "",
      city: current.city || defaults.city || "",
      address: current.address || defaults.address || "",
      deliveryNotes: current.deliveryNotes || defaults.deliveryNotes || "",
      deliveryMethod: defaults.deliveryMethod || current.deliveryMethod || "delivery",
    }));
  }, [profile, user?.email]);

  if (orderId) {
    return (
      <div className="container-page py-16 text-center">
        <CheckCircle className="mx-auto h-14 w-14 text-green-600" />
        <h1 className="mt-4 text-3xl font-black">Porosia u konfirmua</h1>
        <p className="mt-2 text-muted-foreground">Numri i porosisë është {orderId}. Dërgesa e vlerësuar: {estimatedDeliveryDate ? new Date(estimatedDeliveryDate).toLocaleDateString() : "së shpejti"}.</p>
        <p className="mt-2 text-sm text-muted-foreground">{emailSent ? "Emaili i konfirmimit me pagesën, dërgesën dhe garancinë u dërgua." : "Porosia u ruajt. Për konfirmim më të shpejtë, dërgo detajet në WhatsApp."}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {whatsAppOrderUrl && (
            <a href={whatsAppOrderUrl} target="_blank" rel="noreferrer">
              <Button><MessageCircle className="h-5 w-5" /> Dërgo në WhatsApp</Button>
            </a>
          )}
          <Link to="/products"><Button variant="outline">Vazhdo blerjen</Button></Link>
        </div>
      </div>
    );
  }

  if (!items.length) return <div className="container-page py-16 text-center"><h1 className="text-3xl font-black">Nuk ka produkte për pagesë</h1></div>;

  const update = (key: keyof CheckoutForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const chooseDelivery = (deliveryMethod: DeliveryMethod) => setForm((current) => ({ ...current, deliveryMethod }));
  const choosePayment = (paymentMethod: PaymentMethod) => setForm((current) => ({ ...current, paymentMethod }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step === 1 && form.deliveryMethod === "delivery" && (!form.city.trim() || !form.address.trim())) {
      showToast("Plotëso qytetin dhe adresën për dërgesë.", "error");
      return;
    }
    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    setProcessingPayment(true);
    try {
      const result = await createOrder(form, items, user?.id);
      if (result.error || !result.orderId) {
        showToast("Porosia nuk mund të ruhej. Kontrollo konfigurimin e Supabase.", "error");
        return;
      }

      const nextWhatsAppUrl = whatsappUrl(buildOrderWhatsAppMessage(result.orderId, form, items, result.estimatedDeliveryDate));
      clearCart();
      if (user?.id) await refreshProfile();
      setEmailSent(result.emailSent);
      setEstimatedDeliveryDate(result.estimatedDeliveryDate);
      setWhatsAppOrderUrl(nextWhatsAppUrl);
      setOrderId(result.orderId);
      window.open(nextWhatsAppUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Porosia nuk mund të përgatitej.", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">Pagesa</h1>
      <p className="mt-2 rounded-md border bg-white p-3 text-sm text-muted-foreground">Për të kryer porosinë duhet të jesh i/e hyrë në llogari. Produktet në shportë ruhen automatikisht gjatë hyrjes ose regjistrimit.</p>
      <p className="mt-2 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-slate-700">Pagesa dhe konfirmimi bëhen përmes WhatsApp në numrin <a className="font-black text-primary" href={storeWhatsAppUrl()} target="_blank" rel="noreferrer">{WHATSAPP_DISPLAY_NUMBER}</a>.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={(event) => void submit(event)} className="rounded-lg border bg-white p-5">
          <div className="mb-6 grid gap-2 sm:grid-cols-4">
            {steps.map((label, index) => <div key={label} className={`rounded-md px-3 py-2 text-sm font-bold ${index === step ? "bg-primary text-white" : "bg-slate-100"}`}>{label}</div>)}
          </div>
          {step === 0 && <div className="grid gap-4 sm:grid-cols-2"><Input required placeholder="Emri dhe mbiemri" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} /><Input required placeholder="Numri i telefonit" value={form.phone} onChange={(e) => update("phone", e.target.value)} /><Input required type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>}
          {step === 1 && (
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <button type="button" onClick={() => chooseDelivery("delivery")} className={`rounded-lg border p-4 text-left transition hover:border-primary ${form.deliveryMethod === "delivery" ? "border-primary bg-orange-50 ring-2 ring-orange-100" : "bg-white"}`}>
                  <Truck className="h-6 w-6 text-primary" />
                  <strong className="mt-3 block">Dërgesë në adresë</strong>
                  <span className="mt-1 block text-sm text-muted-foreground">Produkti dërgohet në qytetin dhe adresën që shkruan më poshtë.</span>
                </button>
                <button type="button" onClick={() => chooseDelivery("pickup")} className={`rounded-lg border p-4 text-left transition hover:border-primary ${form.deliveryMethod === "pickup" ? "border-primary bg-orange-50 ring-2 ring-orange-100" : "bg-white"}`}>
                  <Store className="h-6 w-6 text-primary" />
                  <strong className="mt-3 block">Marrje në dyqan</strong>
                  <span className="mt-1 block text-sm text-muted-foreground">Rezervo porosinë dhe merre në dyqan pa kosto dërgese.</span>
                </button>
              </div>
              {form.deliveryMethod === "pickup" && <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-slate-700"><strong>Lokacioni:</strong> Mobil Shop Medium, Prizren. Porosia mbahet e rezervuar pas konfirmimit në WhatsApp.</div>}
              <Input required={form.deliveryMethod === "delivery"} placeholder={form.deliveryMethod === "delivery" ? "Qyteti" : "Qyteti (opsionale)"} value={form.city} onChange={(e) => update("city", e.target.value)} />
              <Input required={form.deliveryMethod === "delivery"} placeholder={form.deliveryMethod === "delivery" ? "Adresa" : "Adresa (opsionale)"} value={form.address} onChange={(e) => update("address", e.target.value)} />
              <Input placeholder="Shënime për porosinë" value={form.deliveryNotes} onChange={(e) => update("deliveryNotes", e.target.value)} />
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-3">
                <button type="button" onClick={() => choosePayment("cash")} className={`rounded-lg border p-4 text-left transition hover:border-primary ${form.paymentMethod === "cash" ? "border-primary bg-orange-50 ring-2 ring-orange-100" : "bg-white"}`}>
                  <HandCoins className="h-6 w-6 text-primary" />
                  <strong className="mt-3 block">Pagesë në dorë</strong>
                  <span className="mt-1 block text-sm text-muted-foreground">{form.deliveryMethod === "pickup" ? "Paguaj kur e merr në dyqan." : "Paguaj kur pranon produktin."}</span>
                </button>
                <button type="button" onClick={() => choosePayment("electronic-full")} className={`rounded-lg border p-4 text-left transition hover:border-primary ${form.paymentMethod === "electronic-full" ? "border-primary bg-orange-50 ring-2 ring-orange-100" : "bg-white"}`}>
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <strong className="mt-3 block">Pagesë elektronike</strong>
                  <span className="mt-1 block text-sm text-muted-foreground">Dërgo porosinë në WhatsApp dhe merr udhëzimet për pagesë.</span>
                </button>
                <button type="button" onClick={() => choosePayment("monthly")} className={`rounded-lg border p-4 text-left transition hover:border-primary ${form.paymentMethod === "monthly" ? "border-primary bg-orange-50 ring-2 ring-orange-100" : "bg-white"}`}>
                  <PackageCheck className="h-6 w-6 text-primary" />
                  <strong className="mt-3 block">Pagesë mujore</strong>
                  <span className="mt-1 block text-sm text-muted-foreground">Kërko plan mujor në WhatsApp dhe konfirmo kushtet me dyqanin.</span>
                </button>
              </div>
              {form.paymentMethod === "monthly" && (
                <div className="grid gap-3 rounded-md border bg-slate-50 p-4 sm:grid-cols-[180px_1fr]">
                  <Select value={form.installmentMonths} onChange={(e) => update("installmentMonths", e.target.value)}>
                    <option value="3">3 muaj</option>
                    <option value="6">6 muaj</option>
                    <option value="12">12 muaj</option>
                    <option value="24">24 muaj</option>
                  </Select>
                  <p className="text-sm text-muted-foreground">Rreth <strong className="text-slate-900">{formatCurrency(monthlyAmount)}</strong> në muaj për {form.installmentMonths} muaj. Kushtet finale konfirmohen në WhatsApp.</p>
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-md border bg-slate-50 p-4 text-sm">
                <p><strong>Marrja:</strong> {sqDeliveryMethod(form.deliveryMethod)}</p>
                <p><strong>Pagesa:</strong> {sqPayment(form.paymentMethod)}{form.paymentMethod === "monthly" ? ` (${form.installmentMonths} muaj, ${formatCurrency(monthlyAmount)}/muaj)` : ""}</p>
              </div>
              {items.map((item) => <div key={item.product.id} className="flex justify-between text-sm"><span>{item.quantity} x {item.product.name}</span><strong>{formatCurrency(item.quantity * item.product.price)}</strong></div>)}
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <Button type="button" variant="outline" disabled={step === 0 || processingPayment} onClick={() => setStep((value) => value - 1)}>Mbrapa</Button>
            <Button type="submit" disabled={processingPayment}>
              {processingPayment ? "Po përgatitet..." : step === steps.length - 1 ? "Porosit në WhatsApp" : "Vazhdo"}
            </Button>
          </div>
        </form>
        <CartSummary totals={totals} deliveryLabel={sqDeliveryMethod(form.deliveryMethod)} />
      </div>
    </div>
  );
}
