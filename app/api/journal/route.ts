import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import type { RawCapture } from "@/lib/types";

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from("raw_captures")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("classification->>kind", "journal")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data as RawCapture[] });
}
