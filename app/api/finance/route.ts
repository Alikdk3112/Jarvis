import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import type { DailyLog } from "@/lib/types";

/** Read-only — never triggers the AI pipeline. See /api/finance/snapshot for that. */
export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from("daily_logs")
    .select("*")
    .eq("user_id", USER_ID)
    .not("notes->finance", "is", null)
    .order("log_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const log = data as DailyLog | null;
  return NextResponse.json({ snapshot: log?.notes.finance ?? null });
}
