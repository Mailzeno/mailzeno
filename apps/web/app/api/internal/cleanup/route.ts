import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    //  Secret header protection
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("emails_log")
      .delete()
      .lt("retention_expires_at", now);

    if (error) {
      console.error("[CLEANUP ERROR]", error);
      return NextResponse.json(
        { success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Expired emails cleaned",
    });
  } catch (err) {
    console.error("[CLEANUP FATAL ERROR]", err);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
