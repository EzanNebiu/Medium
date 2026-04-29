import { Heart, Menu, ShoppingCart, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { categories } from "../../data/seedProducts";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { Button } from "../ui/button";
import { sqCategory } from "../../lib/albanian";
import { SearchBox } from "../products/SearchBox";

export function Header() {
  const [open, setOpen] = useState(false);
  const { items } = useCart();
  const { wishlist } = useWishlist();
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="bg-slate-950 py-2 text-center text-xs font-medium text-white">Ofertat pranverore për telefona janë aktive. Dërgesë falas mbi 250 EUR.</div>
      <div className="container-page flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link to="/" className="min-w-0 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
          Medium <span className="text-primary">Mobil Shop</span>
        </Link>
        <SearchBox className="hidden flex-1 md:block" />
        <nav className="ml-auto flex items-center gap-1">
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link className="text-sm font-semibold" to="/account">{profile?.full_name ?? user.email}</Link>
              <Button variant="ghost" size="sm" onClick={() => void signOut()}>Dil</Button>
            </div>
          ) : (
            <Link className="hidden text-sm font-semibold md:block" to="/login">Hyr</Link>
          )}
          <Link to="/wishlist" className="relative rounded-md p-2 hover:bg-accent" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-xs text-white">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="relative rounded-md p-2 hover:bg-accent" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-xs text-white">{items.length}</span>}
          </Link>
          <Link to="/account" className="rounded-md p-2 hover:bg-accent" aria-label="Account">
            <UserRound className="h-5 w-5" />
          </Link>
        </nav>
      </div>
      <div className={`${open ? "block" : "hidden"} border-t md:block`}>
        <div className="container-page py-3 md:hidden">
          <SearchBox />
        </div>
        <nav className="container-page flex flex-col gap-1 py-3 text-sm font-semibold md:flex-row md:flex-wrap md:items-center">
          <NavLink to="/products" className="rounded-md px-3 py-2 hover:bg-accent">Të gjitha produktet</NavLink>
          {categories.map((category) => (
            <NavLink key={category} to={`/products?category=${encodeURIComponent(category)}`} className="rounded-md px-3 py-2 hover:bg-accent">
              {sqCategory(category)}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
