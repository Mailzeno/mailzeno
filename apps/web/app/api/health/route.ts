import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Simple DB check
    const { error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database unreachable",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        status: "ok",
        service: "mailzeno-api",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        message: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
