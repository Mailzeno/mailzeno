import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

//  Range mode 

  if (range === "7" || range === "30") {
    const days = Number(range)

    const { data } = await supabase.rpc("get_email_stats", {
      days,
    })

    return Response.json({
      daily: data || [],
    })
  }

//  overview mode

  const todayISO = new Date().toISOString().split("T")[0]

  const { count: todayCount } = await supabase
    .from("emails_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", todayISO)

  const firstDay = new Date()
  firstDay.setDate(1)

  const { count: monthCount } = await supabase
    .from("emails_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", firstDay.toISOString())

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("plan, pro_expires_at")
    .eq("id", user.id)
    .single()

  let plan = profile?.plan || "free"
  let limit: number | null = 100

  if (
    plan === "pro" &&
    profile?.pro_expires_at &&
    new Date(profile.pro_expires_at) > new Date()
  ) {
    limit = 10000
  }

  return Response.json({
    today: todayCount ?? 0,
    month: monthCount ?? 0,
    plan,
    limit,
  })
}
