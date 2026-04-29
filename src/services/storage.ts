import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { slugify } from "../lib/utils";

const PRODUCT_BUCKET = "product-images";

export async function uploadProductImage(file: File, productName: string) {
  if (!isSupabaseConfigured) {
    return readFileAsDataUrl(file);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${slugify(productName || "product")}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) throw error;
  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}
