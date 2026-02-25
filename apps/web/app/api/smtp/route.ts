import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createEncryptionService } from "@/lib/encryption"

export const runtime = "nodejs"

// 🔹 GET SMTP Accounts (User-scoped)
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("smtp_accounts")
    .select(
      "id, name, host, port, username, from_email, from_name, is_active, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// 🔹 Create SMTP
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const encryption = createEncryptionService()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const {
    name,
    host,
    port,
    username,
    password,
    from_email,
    from_name,
    secure
  } = body

  if (!name || !host || !port || !username || !password) {
    return NextResponse.json(
      { error: "Missing required SMTP fields" },
      { status: 400 }
    )
  }

  const encryptedPassword = encryption.encrypt(password)

  // 🔥 Deactivate old SMTP accounts
  await supabase
    .from("smtp_accounts")
    .update({ is_active: false })
    .eq("user_id", user.id)

  const { data, error } = await supabase
    .from("smtp_accounts")
    .insert({
      user_id: user.id,
      name,
      host,
      port: Number(port),
      username,
      password_encrypted: encryptedPassword,
      from_email,
      from_name,
      secure,
      is_active: true
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
