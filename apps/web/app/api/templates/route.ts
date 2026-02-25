import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

//  Helper functions

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractVariables(text: string) {
  const regex = /{{(.*?)}}/g;
  const matches = [...text.matchAll(regex)];
  return [...new Set(matches.map((m) => m[1].trim()))];
}

// API Routes GET /api/templates -> list templates

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

// API Routes  create template

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, subject, body } = await req.json();

  if (!name || !subject || !body) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  const slug = generateSlug(name);
  const variables = extractVariables(subject + " " + body);

  const { data, error } = await supabase
    .from("templates")
    .insert([
      {
        user_id: user.id,
        name,
        slug,
        subject,
        body,
        variables,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
