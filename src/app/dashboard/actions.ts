"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { SKIN_IDS } from "@/lib/skins";

export async function createStore(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") || "").trim();
  let skin = String(formData.get("skin") || "mono");
  if (!name) return;
  if (!SKIN_IDS.includes(skin)) skin = "mono";

  // 슬러그 생성 + 유니크 보장
  const base = slugify(name) || "store";
  let slug = base;
  for (let i = 0; i < 6; i++) {
    const { data } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  await supabase.from("stores").insert({ name, skin, slug }); // owner = auth.uid() (DB default)
  revalidatePath("/dashboard");
}

export async function deleteStore(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await supabase.from("stores").delete().eq("id", id);
  revalidatePath("/dashboard");
}
