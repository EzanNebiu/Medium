import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "../components/admin/AdminLayout";
import { PageShell } from "../components/layout/PageShell";
import Account from "../pages/Account";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Orders from "../pages/Orders";
import ProductDetails from "../pages/ProductDetails";
import Products from "../pages/Products";
import Register from "../pages/Register";
import Wishlist from "../pages/Wishlist";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminEditProduct from "../pages/admin/AdminEditProduct";
import AdminHomepage from "../pages/admin/AdminHomepage";
import AdminNewProduct from "../pages/admin/AdminNewProduct";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminProducts from "../pages/admin/AdminProducts";
import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PageShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminNewProduct />} />
            <Route path="products/:id/edit" element={<AdminEditProduct />} />
            <Route path="homepage" element={<AdminHomepage />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Route>
        <Route path="*" element={<div className="container-page py-16"><h1 className="text-3xl font-black">Faqja nuk u gjet</h1></div>} />
      </Route>
    </Routes>
  );
}
