import { NextResponse, type NextRequest } from "next/server";
import { getDailyLog, upsertDailyLogNotes } from "@/lib/dailyLogs";
import { GOALS_SENTINEL_DATE, type GoalItem } from "@/lib/types";

export async function GET() {
  const log = await getDailyLog(GOALS_SENTINEL_DATE);
  return NextResponse.json({
    week: log?.notes.goals_week_items ?? [],
    month: log?.notes.goals_month_items ?? [],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const scope = body?.scope as "week" | "month" | undefined;
  const items = body?.items as GoalItem[] | undefined;
  if ((scope !== "week" && scope !== "month") || !Array.isArray(items)) {
    return NextResponse.json({ error: "expected { scope: 'week'|'month', items: GoalItem[] }" }, { status: 400 });
  }

  const key = scope === "week" ? "goals_week_items" : "goals_month_items";
  const log = await upsertDailyLogNotes(GOALS_SENTINEL_DATE, { [key]: items });
  return NextResponse.json({ week: log.notes.goals_week_items ?? [], month: log.notes.goals_month_items ?? [] });
}
