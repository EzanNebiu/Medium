export type ProfileRole = "user" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  role: ProfileRole;
  created_at?: string;
  updated_at?: string;
};
