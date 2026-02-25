import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { id, name, subject, body } = await req.json();
  const supabase = await createClient();

  if (id) {
    await supabase
      .from("templates")
      .update({ name, subject, body })
      .eq("id", id);

    return NextResponse.json({ id });
  }

  const { data } = await supabase
    .from("templates")
    .insert({ name, subject, body })
    .select()
    .single();

  return NextResponse.json({ id: data.id });
}
