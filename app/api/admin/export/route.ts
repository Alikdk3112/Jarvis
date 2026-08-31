import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";

const TABLES = [
  "os_entities",
  "os_raw_captures",
  "os_tasks",
  "os_daily_logs",
  "os_memory_chunks",
  "os_audit_log",
] as const;

/** Manual backup — a JSON snapshot of every table, scoped to this user. */
export async function GET() {
  const admin = supabaseAdmin();
  const snapshot: Record<string, unknown> = {};

  for (const table of TABLES) {
    const { data, error } = await admin.from(table).select("*").eq("user_id", USER_ID);
    if (error) return NextResponse.json({ error: `${table}: ${error.message}` }, { status: 500 });
    snapshot[table] = data;
  }

  return NextResponse.json({ exported_at: new Date().toISOString(), ...snapshot });
}
