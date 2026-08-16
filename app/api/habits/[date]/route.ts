import { NextResponse, type NextRequest } from "next/server";
import { upsertDailyLogNotes } from "@/lib/dailyLogs";
import type { HabitState } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const body = (await req.json().catch(() => null)) as HabitState | null;
  if (!body || !Array.isArray(body.done) || typeof body.total !== "number") {
    return NextResponse.json({ error: "expected { done: string[], total: number }" }, { status: 400 });
  }

  const log = await upsertDailyLogNotes(date, { habits: body });
  return NextResponse.json({ habits: log.notes.habits });
}
