import { NextResponse, type NextRequest } from "next/server";
import { getDailyLogsRange } from "@/lib/dailyLogs";

export async function GET(req: NextRequest) {
  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const logs = await getDailyLogsRange(days);
  const habits = logs
    .filter((l) => l.notes.habits)
    .map((l) => ({ date: l.log_date, habits: l.notes.habits! }));
  return NextResponse.json({ habits });
}
