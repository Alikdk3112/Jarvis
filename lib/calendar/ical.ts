import ICAL from "ical.js";

export interface CalendarEvent {
  uid: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
}

interface Cache {
  events: CalendarEvent[];
  expiresAt: number;
}

// Module-memory cache. Best-effort across serverless invocations — a cold
// start just re-fetches. 5 minutes matches the guide's staleness budget.
let cache: Cache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;
const WINDOW_DAYS = 14;

/**
 * Parses the iCal feed with ical.js (NOT node-ical — its BigInt usage gets
 * mangled by Next.js's bundler in production, see Part 8 of the build guide).
 */
export async function loadCalendarEvents(icalUrl: string): Promise<CalendarEvent[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.events;

  const res = await fetch(icalUrl);
  if (!res.ok) throw new Error(`Failed to fetch calendar feed: ${res.status}`);
  const text = await res.text();

  const jcalData = ICAL.parse(text);
  const component = new ICAL.Component(jcalData);
  const vevents = component.getAllSubcomponents("vevent");

  const windowStart = ICAL.Time.now();
  const windowEnd = windowStart.clone();
  windowEnd.adjust(WINDOW_DAYS, 0, 0, 0);

  const events: CalendarEvent[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    if (event.isRecurring()) {
      const iterator = event.iterator();
      let next = iterator.next();
      while (next) {
        if (next.compare(windowEnd) > 0) break;
        if (next.compare(windowStart) >= 0) {
          const end = next.clone();
          end.addDuration(event.duration);
          events.push({
            uid: `${event.uid}-${next.toString()}`,
            summary: event.summary ?? "(untitled)",
            start: next.toJSDate().toISOString(),
            end: end.toJSDate().toISOString(),
            allDay: Boolean(next.isDate),
          });
        }
        next = iterator.next();
      }
      continue;
    }

    const start = event.startDate;
    const end = event.endDate;
    if (!start || !end) continue;
    if (end.compare(windowStart) < 0 || start.compare(windowEnd) > 0) continue;

    events.push({
      uid: event.uid,
      summary: event.summary ?? "(untitled)",
      start: start.toJSDate().toISOString(),
      end: end.toJSDate().toISOString(),
      allDay: Boolean(start.isDate),
    });
  }

  events.sort((a, b) => a.start.localeCompare(b.start));
  cache = { events, expiresAt: Date.now() + CACHE_TTL_MS };
  return events;
}
