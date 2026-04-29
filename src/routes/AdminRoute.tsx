import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin";
import { useAuth } from "../hooks/useAuth";

export function AdminRoute() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading } = useAdmin();
  if (authLoading || loading) return <div className="container-page py-12">Po kontrollohet qasja e administratorit...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
