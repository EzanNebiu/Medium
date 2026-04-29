export type ProfileRole = "user" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  delivery_notes?: string | null;
  preferred_delivery_method?: "delivery" | "pickup" | null;
  role: ProfileRole;
  created_at?: string;
  updated_at?: string;
};
