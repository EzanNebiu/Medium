import { Card } from "../components/ui/card";
import { useAuth } from "../hooks/useAuth";

export default function Account() {
  const { user, profile } = useAuth();
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">Llogaria</h1>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Card className="p-5"><h2 className="font-black">Të dhënat e profilit</h2><p className="mt-3 text-sm text-muted-foreground">{profile?.full_name ?? "Klient i Medium Mobil Shop"}</p><p className="text-sm">{user?.email}</p><p className="text-sm">{profile?.phone ?? "Numri nuk është ruajtur ende"}</p></Card>
        <Card className="p-5"><h2 className="font-black">Adresat e ruajtura</h2><p className="mt-3 text-sm text-muted-foreground">{profile?.city || profile?.address ? `${profile?.city ?? ""} ${profile?.address ?? ""}`.trim() : "Adresa ruhet automatikisht pas porosisë së radhës."}</p>{profile?.delivery_notes && <p className="mt-2 text-xs text-muted-foreground">{profile.delivery_notes}</p>}</Card>
        <Card className="p-5"><h2 className="font-black">Cilësimet e llogarisë</h2><p className="mt-3 text-sm text-muted-foreground">Menaxho hyrjen, preferencat dhe kërkesat për mbështetje.</p></Card>
      </div>
    </div>
  );
}
