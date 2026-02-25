import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Utils  */

function generateApiKey() {
  const random = crypto.randomBytes(24).toString("hex");
  return `mz_api_${random}`;
}

function hashApiKey(rawKey: string) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/* GET Active Key */

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, prefix, is_active, created_at, last_used_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? null });
}

// Create or Rotate api Key

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const prefix = rawKey.slice(0, 14);

  // Deactivate existing active key

  const { error: deactivateError } = await supabase
    .from("api_keys")
    .update({ is_active: false })
    .eq("user_id", user.id)


  if (deactivateError) {
    return NextResponse.json(
      { error: deactivateError.message },
      { status: 500 },
    );
  }

  // Insert new key
  const { error: insertError } = await supabase.from("api_keys").insert({
    user_id: user.id,
    key_hash: keyHash,
    prefix,
    is_active: true,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    apiKey: rawKey, 
  });
}
