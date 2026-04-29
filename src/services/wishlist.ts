import { isSupabaseConfigured, supabase } from "../lib/supabase";

export async function toggleWishlist(productId: string, userId?: string) {
  if (!userId) return { error: new Error("Kërkohet hyrja në llogari") };
  if (!isSupabaseConfigured) return { error: null };
  const { data } = await supabase.from("wishlists").select("id").eq("user_id", userId).eq("product_id", productId).maybeSingle();
  if (data) return supabase.from("wishlists").delete().eq("id", data.id);
  return supabase.from("wishlists").insert({ user_id: userId, product_id: productId });
}
