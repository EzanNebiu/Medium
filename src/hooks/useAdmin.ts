import { useAuth } from "./useAuth";

export function useAdmin() {
  const { profile, loading } = useAuth();
  return { isAdmin: profile?.role === "admin", loading };
}
