import { NextResponse } from "next/server";
import { loadCalendarEvents } from "@/lib/calendar/ical";

export async function GET() {
  const icalUrl = process.env.GOOGLE_CALENDAR_ICAL_URL;
  if (!icalUrl) {
    return NextResponse.json(
      { events: [], error: "GOOGLE_CALENDAR_ICAL_URL is not configured" },
      { headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const events = await loadCalendarEvents(icalUrl);
    return NextResponse.json({ events }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    return NextResponse.json(
      { events: [], error: err instanceof Error ? err.message : "unknown error" },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}
