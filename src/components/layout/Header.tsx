import { Heart, Menu, MessageCircle, ShoppingCart, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { categories } from "../../data/seedProducts";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { Button } from "../ui/button";
import { sqCategory } from "../../lib/albanian";
import { SearchBox } from "../products/SearchBox";
import { storeWhatsAppUrl } from "../../lib/whatsapp";

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { items } = useCart();
  const { wishlist } = useWishlist();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="bg-black py-2 text-center text-xs font-medium text-white">Oferta aktive për telefona dhe aksesorë. Konfirmo porosinë në WhatsApp.</div>
      <div className="container-page flex items-center gap-3 py-4 sm:gap-5 sm:py-5">
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden" aria-expanded={open} aria-label={open ? "Mbyll menunë" : "Hap menunë"} onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link to="/" onClick={closeMenu} className="min-w-0 flex-1 truncate text-lg font-black tracking-tight text-black sm:text-2xl md:flex-none">
          Medium <span className="text-primary">Mobil</span> Shop
        </Link>
        <SearchBox className="hidden max-w-[420px] flex-1 md:block" />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-zinc-500 lg:flex">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-black" : "hover:text-black"}>Ballina</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? "text-black" : "hover:text-black"}>Produktet</NavLink>
          <a href="#sherbime" className="hover:text-black">Shërbime</a>
          <a href={storeWhatsAppUrl()} target="_blank" rel="noreferrer" className="hover:text-black">Kontakt</a>
        </nav>
        <nav className="ml-auto flex shrink-0 items-center gap-1">
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link className="text-sm font-semibold" to="/account">{profile?.full_name ?? user.email}</Link>
              <Button variant="ghost" size="sm" onClick={() => void signOut()}>Dil</Button>
            </div>
          ) : (
            <Link className="hidden text-sm font-semibold md:block" to="/login">Hyr</Link>
          )}
          <a href={storeWhatsAppUrl()} target="_blank" rel="noreferrer" className="hidden rounded-md p-2 hover:bg-accent md:inline-flex" aria-label="WhatsApp">
            <MessageCircle className="h-5 w-5" />
          </a>
          <Link to="/wishlist" onClick={closeMenu} className="relative rounded-md p-2 hover:bg-accent" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-xs text-white">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" onClick={closeMenu} className="relative rounded-md p-2 hover:bg-accent" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-xs text-white">{items.length}</span>}
          </Link>
          <Link to="/account" onClick={closeMenu} className="rounded-md p-2 hover:bg-accent" aria-label="Account">
            <UserRound className="h-5 w-5" />
          </Link>
        </nav>
      </div>
      <div className={`${open ? "block" : "hidden"} border-t border-black/10 md:block`}>
        <div className="container-page py-3 md:hidden">
          <SearchBox />
        </div>
        <nav className="container-page flex max-h-[calc(100vh-155px)] flex-col gap-1 overflow-y-auto py-3 text-sm font-semibold md:max-h-none md:flex-row md:flex-nowrap md:items-center md:overflow-x-auto md:overflow-y-visible">
          <NavLink to="/" onClick={closeMenu} className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-accent md:hidden">Ballina</NavLink>
          <NavLink to="/products" onClick={closeMenu} className="whitespace-nowrap rounded-md px-3 py-2 hover:bg-accent">Të gjitha produktet</NavLink>
          {categories.map((category) => (
            <NavLink key={category} to={`/products?category=${encodeURIComponent(category)}`} onClick={closeMenu} className="whitespace-nowrap rounded-md px-3 py-2 text-zinc-600 hover:bg-accent hover:text-black">
              {sqCategory(category)}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
