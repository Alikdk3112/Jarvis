import { NextResponse, type NextRequest } from "next/server";
import { upsertDailyLogNotes } from "@/lib/dailyLogs";
import type { Meal } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const body = await req.json().catch(() => null);
  const meals = body?.meals as Meal[] | undefined;
  if (!Array.isArray(meals)) return NextResponse.json({ error: "meals[] is required" }, { status: 400 });

  const log = await upsertDailyLogNotes(date, { nutrition: { meals } });
  return NextResponse.json({ meals: log.notes.nutrition?.meals ?? [] });
}
