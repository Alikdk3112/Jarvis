import { supabaseAdmin } from "@/lib/supabase/server";
import { USER_ID } from "@/lib/config";
import type { DailyLog, DailyLogNotes } from "@/lib/types";

export async function getDailyLog(logDate: string): Promise<DailyLog | null> {
  const { data, error } = await supabaseAdmin()
    .from("os_daily_logs")
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
    .from("os_daily_logs")
    .select("*")
    .eq("user_id", USER_ID)
    .gte("log_date", since.toISOString().slice(0, 10))
    .order("log_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as DailyLog[]) ?? [];
}

/**
 * Shallow-merges `patch` into that day's notes JSON — other modules' keys are
 * preserved. The merge happens Postgres-side (`jsonb ||`, see migration 0002)
 * rather than read-modify-write in JS: habits, nutrition, goals and the
 * finance cron all write this one row, and a JS merge lets two overlapping
 * writers drop each other's keys.
 */
export async function upsertDailyLogNotes(
  logDate: string,
  patch: Partial<DailyLogNotes>,
): Promise<DailyLog> {
  const { data, error } = await supabaseAdmin()
    .rpc("merge_os_daily_log_notes", {
      p_user_id: USER_ID,
      p_log_date: logDate,
      p_patch: patch,
    })
    // The function returns one composite row; .single() pins the response to a
    // single object rather than leaving it to PostgREST's default shape.
    .single();

  if (error) throw new Error(error.message);
  return data as DailyLog;
}
