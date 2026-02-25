import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

// 🔹 Activate / Deactivate SMTP
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await context.params

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { is_active } = body

  if (typeof is_active !== "boolean") {
    return NextResponse.json(
      { error: "Invalid is_active value" },
      { status: 400 }
    )
  }

  try {
    // 🔥 If activating → deactivate others first
    if (is_active) {
      const { error: resetError } = await supabase
        .from("smtp_accounts")
        .update({ is_active: false })
        .eq("user_id", user.id)

      if (resetError) throw resetError
    }

    const { error } = await supabase
      .from("smtp_accounts")
      .update({ is_active })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update SMTP" },
      { status: 500 }
    )
  }
}

// 🔹 Delete SMTP
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await context.params

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from("smtp_accounts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete SMTP" },
      { status: 500 }
    )
  }
}
