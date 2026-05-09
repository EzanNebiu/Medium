import { ArrowUp, BriefcaseBusiness, Code2, Mail, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const contact = {
  name: "Ezan M. Nebija",
  email: "ezannebiu8@gmail.com",
  linkedInUrl: "https://www.linkedin.com/in/ezan-nebiu-2b0966311",
  gitHubUrl: "https://github.com/EzanNebiu",
};

const quickLinks = [
  ["/", "Ballina"],
  ["/products", "Produktet"],
  ["/cart", "Shporta"],
  ["/wishlist", "Lista e dëshirave"],
  ["/orders", "Porositë"],
] as const;

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 420);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <footer className="mt-16 border-t border-orange-500/20 bg-black text-white">
        <div className="container-page py-12">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
            <div>
              <Link to="/" className="text-2xl font-black tracking-tight">
                Medium <span className="text-primary">Mobil Shop</span>
              </Link>
              <p className="mt-3 max-w-sm text-sm text-zinc-300">
                Dyqan modern për telefona, aksesorë, servisim dhe porosi përmes WhatsApp në Prizren.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-zinc-200">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"><Truck className="h-4 w-4 text-primary" /> Dërgesë ose marrje në dyqan</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"><ShieldCheck className="h-4 w-4 text-primary" /> Garanci e përfshirë</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-primary">Linqe të shpejta</h3>
              <nav className="mt-4 grid gap-2 text-sm text-zinc-300">
                {quickLinks.map(([to, label]) => (
                  <Link key={to} to={to} className="hover:text-primary">{label}</Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-primary">Kontakt</h3>
              <div className="mt-4 grid gap-3 text-sm text-zinc-300">
                <a className="flex items-center gap-2 hover:text-primary" href={`mailto:${contact.email}`}><Mail className="h-4 w-4" /> {contact.email}</a>
                <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Mbështetje për klientë</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Prizren, Kosovë</span>
              </div>
              <div className="mt-5 flex gap-3">
                <a className="rounded-md border border-white/10 p-2 text-zinc-300 transition hover:border-primary hover:text-primary" href={contact.linkedInUrl.trim()} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <BriefcaseBusiness className="h-5 w-5" />
                </a>
                <a className="rounded-md border border-white/10 p-2 text-zinc-300 transition hover:border-primary hover:text-primary" href={contact.gitHubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <Code2 className="h-5 w-5" />
                </a>
                <a className="rounded-md border border-white/10 p-2 text-zinc-300 transition hover:border-primary hover:text-primary" href={`mailto:${contact.email}`} aria-label="Email">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-zinc-500">
            © {new Date().getFullYear()} Medium Mobil Shop. Zhvilluar nga {contact.name}.
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <Button className="fixed bottom-6 right-6 z-50 rounded-full shadow-soft" size="icon" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
