import { Heart, Menu, MessageCircle, ShoppingCart, UserRound, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { categories, seedProducts } from "../../data/seedProducts";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { Button } from "../ui/button";
import { sqCategory } from "../../lib/albanian";
import { SearchBox } from "../products/SearchBox";
import { storeWhatsAppUrl } from "../../lib/whatsapp";

export function Header() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();
  const { items } = useCart();
  const { wishlist } = useWishlist();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    setOpen(false);
    setProductsOpen(false);
  }, [location.pathname, location.search]);

  const closeMenu = () => {
    setOpen(false);
    setProductsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="bg-black py-2 text-center text-xs font-medium text-white">Oferta aktive për telefona dhe aksesorë. Konfirmo porosinë në WhatsApp.</div>
      <div className="container-page flex items-center gap-3 py-2 sm:gap-4 sm:py-3">
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden" aria-expanded={open} aria-label={open ? "Mbyll menunë" : "Hap menunë"} onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link to="/" onClick={closeMenu} className="min-w-0 flex-1 truncate text-lg font-black tracking-tight text-black sm:text-2xl md:flex-none">
          Medium <span className="text-primary">Mobil</span> Shop
        </Link>
        <SearchBox className="hidden max-w-[420px] flex-1 md:block" />
        <nav className="hidden items-center gap-8 text-xs font-semibold text-zinc-500 lg:flex">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-black" : "hover:text-black"}>Ballina</NavLink>
          
          {/* Desktop Products Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProductsOpen(!productsOpen)}
              className="flex items-center gap-1 hover:text-black"
            >
              Produktet <ChevronDown className={`h-3 w-3 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            {productsOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-[600px] rounded-lg border bg-white shadow-lg">
                <div className="grid grid-cols-3 gap-4 p-4">
                  {categories.map((category) => {
                    const categoryProducts = seedProducts.filter(p => p.category === category).slice(0, 4);
                    return (
                      <div key={category} className="space-y-2">
                        <Link 
                          to={`/products?category=${encodeURIComponent(category)}`}
                          onClick={closeMenu}
                          className="block text-xs font-bold text-black hover:text-primary"
                        >
                          {sqCategory(category)}
                        </Link>
                        <div className="space-y-1">
                          {categoryProducts.map(product => (
                            <Link
                              key={product.id}
                              to={`/products/${product.slug}`}
                              onClick={closeMenu}
                              className="block truncate text-xs text-zinc-600 hover:text-black"
                            >
                              {product.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <a href="#sherbime" className="hover:text-black">Shërbime</a>
          <a href={storeWhatsAppUrl()} target="_blank" rel="noreferrer" className="hover:text-black">Kontakt</a>
        </nav>
        <nav className="ml-auto flex shrink-0 items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link className="text-sm font-semibold" to="/account">{profile?.full_name ?? user.email}</Link>
              <Button variant="ghost" size="sm" onClick={() => void signOut()}>Dil</Button>
            </div>
          ) : (
            <Link className="hidden text-sm font-semibold md:block" to="/login">Hyr</Link>
          )}
          <a href={storeWhatsAppUrl()} target="_blank" rel="noreferrer" className="hidden rounded-md p-2 hover:bg-accent md:inline-flex" aria-label="WhatsApp">
            <MessageCircle className="h-4 w-4" />
          </a>
          <Link to="/wishlist" onClick={closeMenu} className="relative rounded-md p-2 hover:bg-accent" aria-label="Wishlist">
            <Heart className="h-4 w-4" />
            {wishlist.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-xs text-white">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" onClick={closeMenu} className="relative rounded-md p-2 hover:bg-accent" aria-label="Cart">
            <ShoppingCart className="h-4 w-4" />
            {items.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-xs text-white">{items.length}</span>}
          </Link>
          <Link to="/account" onClick={closeMenu} className="rounded-md p-2 hover:bg-accent" aria-label="Account">
            <UserRound className="h-4 w-4" />
          </Link>
        </nav>
      </div>
      {/* Mobile Menu */}
      <div className={`${open ? "block" : "hidden"} border-t border-black/10 lg:hidden`}>
        <div className="container-page py-3">
          <SearchBox />
        </div>
        <nav className="container-page flex max-h-[calc(100vh-155px)] flex-col gap-1 overflow-y-auto py-3 text-xs font-semibold">
          <NavLink to="/" onClick={closeMenu} className="whitespace-nowrap rounded-md px-2.5 py-1.5 hover:bg-accent">Ballina</NavLink>
          
          {/* Mobile Products Dropdown */}
          <div>
            <button 
              onClick={() => setProductsOpen(!productsOpen)}
              className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-zinc-600 hover:bg-accent hover:text-black"
            >
              Produktet <ChevronDown className={`h-3 w-3 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            {productsOpen && (
              <div className="ml-4 mt-1 space-y-3 border-l pl-3">
                {categories.map((category) => {
                  const categoryProducts = seedProducts.filter(p => p.category === category).slice(0, 4);
                  return (
                    <div key={category} className="space-y-1">
                      <Link 
                        to={`/products?category=${encodeURIComponent(category)}`}
                        onClick={closeMenu}
                        className="block text-xs font-bold text-black hover:text-primary"
                      >
                        {sqCategory(category)}
                      </Link>
                      <div className="space-y-0.5">
                        {categoryProducts.map(product => (
                          <Link
                            key={product.id}
                            to={`/products/${product.slug}`}
                            onClick={closeMenu}
                            className="block truncate text-xs text-zinc-600 hover:text-black"
                          >
                            {product.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <a href="#sherbime" onClick={closeMenu} className="whitespace-nowrap rounded-md px-2.5 py-1.5 hover:bg-accent">Shërbime</a>
          <a href={storeWhatsAppUrl()} target="_blank" rel="noreferrer" onClick={closeMenu} className="whitespace-nowrap rounded-md px-2.5 py-1.5 hover:bg-accent">Kontakt</a>
        </nav>
      </div>
    </header>
  );
}
