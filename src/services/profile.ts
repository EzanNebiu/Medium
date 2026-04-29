import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { CheckoutForm } from "../types/order";
import type { Profile } from "../types/user";

export async function saveCheckoutProfile(userId: string, form: CheckoutForm) {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: form.fullName,
    phone: form.phone,
    city: form.city,
    address: form.address,
    delivery_notes: form.deliveryNotes,
    preferred_delivery_method: form.deliveryMethod,
    updated_at: new Date().toISOString(),
  });
  return { error };
}

export function profileToCheckoutDefaults(profile: Profile | null, email?: string | null): Partial<CheckoutForm> {
  if (!profile) return { email: email ?? "" };
  return {
    fullName: profile.full_name ?? "",
    phone: profile.phone ?? "",
    email: email ?? "",
    city: profile.city ?? "",
    address: profile.address ?? "",
    deliveryNotes: profile.delivery_notes ?? "",
    deliveryMethod: profile.preferred_delivery_method ?? "delivery",
  };
}
