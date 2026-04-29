import { ProductForm } from "../../components/admin/ProductForm";

export default function AdminNewProduct() {
  return (
    <section>
      <h1 className="text-3xl font-black">Produkt i ri</h1>
      <p className="mt-2 text-muted-foreground">Importo specifikat e telefonit përmes Supabase Edge Function ose krijoje manualisht.</p>
      <div className="mt-6"><ProductForm /></div>
    </section>
  );
}
