import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* util */

function extractVariables(text: string) {
  const regex = /{{(.*?)}}/g;
  const matches = [...text.matchAll(regex)];
  return [...new Set(matches.map((m) => m[1].trim()))];
}

/* get by id*/

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

/* Update */

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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

  const variables = extractVariables(subject + " " + body);

  const { data, error } = await supabase
    .from("templates")
    .update({
      name,
      subject,
      body,
      variables,
      updated_at: new Date(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

/* Delete */

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("templates")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { message: "Template not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
