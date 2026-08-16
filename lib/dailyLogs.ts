import { supabaseAdmin } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import type { DailyLog, DailyLogNotes } from "@/lib/types";

export async function getDailyLog(logDate: string): Promise<DailyLog | null> {
  const { data, error } = await supabaseAdmin()
    .from("daily_logs")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("log_date", logDate)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DailyLog | null) ?? null;
}

export async function getDailyLogsRange(days: number): Promise<DailyLog[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabaseAdmin()
    .from("daily_logs")
    .select("*")
    .eq("user_id", USER_ID)
    .gte("log_date", since.toISOString().slice(0, 10))
    .order("log_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as DailyLog[]) ?? [];
}

/** Shallow-merges `patch` into that day's notes JSON — other modules' keys are preserved. */
export async function upsertDailyLogNotes(
  logDate: string,
  patch: Partial<DailyLogNotes>,
): Promise<DailyLog> {
  const existing = await getDailyLog(logDate);
  const notes: DailyLogNotes = { ...(existing?.notes ?? {}), ...patch };

  const { data, error } = await supabaseAdmin()
    .from("daily_logs")
    .upsert(
      { user_id: USER_ID, log_date: logDate, notes, updated_at: new Date().toISOString() },
      { onConflict: "user_id,log_date" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DailyLog;
}
