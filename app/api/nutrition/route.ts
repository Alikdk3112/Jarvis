import { NextResponse, type NextRequest } from "next/server";
import { getDailyLogsRange } from "@/lib/dailyLogs";

export async function GET(req: NextRequest) {
  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const logs = await getDailyLogsRange(days);
  const days_data = logs
    .filter((l) => l.notes.nutrition?.meals?.length)
    .map((l) => ({ date: l.log_date, meals: l.notes.nutrition!.meals }));
  return NextResponse.json({ days: days_data });
}
