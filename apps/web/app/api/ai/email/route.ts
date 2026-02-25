import { NextResponse } from "next/server"
import { generateEmailAI } from "@/lib/services/ai.service"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { mode, type, prompt, content } = body

    if (!mode || !type) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    const result = await generateEmailAI({
      mode,
      type,
      prompt,
      content,
    })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "AI error" },
      { status: 500 }
    )
  }
}
