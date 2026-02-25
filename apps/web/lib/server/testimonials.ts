import { createClient } from "@/lib/supabase/server";

export async function AllTestimonials() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true);

  return data ?? [];
}
