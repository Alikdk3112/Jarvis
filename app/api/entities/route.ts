import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from("os_entities")
    .select("*")
    .eq("user_id", USER_ID)
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entities: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin()
    .from("os_entities")
    .insert({ user_id: USER_ID, name: body.name, kind: body.kind ?? "other", metadata: body.metadata ?? {} })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entity: data });
}
