import { createClient } from "@/lib/supabase/server";

type SB = Awaited<ReturnType<typeof createClient>>;

// 이미지 파일을 product-images 버킷의 {uid}/{folder}/ 아래에 올리고 공개 URL 반환.
// 파일 없거나 비었으면 null.
export async function uploadImageFile(
  supabase: SB,
  userId: string,
  folder: string,
  file: FormDataEntryValue | null
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) return null;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}
