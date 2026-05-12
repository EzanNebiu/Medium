import { BarChart3, LayoutTemplate, MessageSquare, Package, PlusCircle, ShoppingBag } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  ["/admin", "Paneli", BarChart3],
  ["/admin/homepage", "Faqja kryesore", LayoutTemplate],
  ["/admin/products", "Produktet", Package],
  ["/admin/products/new", "Shto produkt", PlusCircle],
  ["/admin/orders", "Porositë", ShoppingBag],
  ["/admin/reviews", "Vlerësimet", MessageSquare],
] as const;

export function AdminLayout() {
  return (
    <div className="container-page grid gap-6 py-8 md:grid-cols-[230px_1fr]">
      <aside className="rounded-lg border bg-white p-3">
        <p className="px-3 py-2 text-lg font-black">Administrimi</p>
        <nav className="mt-2 grid gap-1">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === "/admin"} className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${isActive ? "bg-primary text-white" : "hover:bg-accent"}`}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <Outlet />
    </div>
  );
}
