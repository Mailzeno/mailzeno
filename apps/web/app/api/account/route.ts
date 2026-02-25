import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Fetch from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  return Response.json({
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || "",
    created_at: user.created_at,
  })
}


export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { fullName, email } = await req.json()

  // Update name
  if (fullName) {
    await supabase.auth.updateUser({
      data: { full_name: fullName },
    })

    await supabaseAdmin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id)
  }

  // Update email
  if (email && email !== user.email) {
    await supabase.auth.updateUser({ email })
  }

  return Response.json({ success: true })
}

export async function DELETE() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { error: deleteError } =
    await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return new Response("Failed to delete account", { status: 400 })
  }

  return Response.json({ success: true })
}
