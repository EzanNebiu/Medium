import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { Review } from "../types/review";

export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:user_id (
        full_name,
        phone
      )
    `)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((review) => ({
    id: review.id,
    user_id: review.user_id,
    product_id: review.product_id,
    rating: review.rating,
    comment: review.comment,
    created_at: review.created_at,
    user_name: review.profiles?.full_name ?? "Përdorues",
    user_phone: review.profiles?.phone ?? null,
  }));
}

export async function getAllReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:user_id (
        full_name,
        phone
      ),
      products:product_id (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((review) => ({
    id: review.id,
    user_id: review.user_id,
    product_id: review.product_id,
    rating: review.rating,
    comment: review.comment,
    created_at: review.created_at,
    user_name: review.profiles?.full_name ?? "Përdorues",
    user_phone: review.profiles?.phone ?? null,
    product_name: review.products?.name ?? "Produkt",
  }));
}

export async function createReview(productId: string, rating: number, comment: string) {
  if (!isSupabaseConfigured) {
    return { error: new Error("Supabase nuk është konfiguruar") };
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    rating,
    comment,
  });

  return { error };
}

export async function deleteReview(reviewId: string) {
  if (!isSupabaseConfigured) {
    return { error: new Error("Supabase nuk është konfiguruar") };
  }

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  return { error };
}
