/**
 * "What day is it" per the user's own clock — never the server's or UTC's.
 * Use this everywhere a day boundary matters (storage keys, daily_logs
 * writes) or the day silently rolls over at the wrong hour for anyone not
 * in UTC (see Part 8, bug #2, in the build guide).
 */
export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * The inverse of `localDateKey` — `new Date("2026-08-29")` parses as UTC
 * midnight, which renders as the *previous* day west of UTC. This builds the
 * date in local time instead, so weekday/day-number labels match the key.
 */
export function dateKeyToLocalDate(key: string): Date {
  const [year = 1970, month = 1, day = 1] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}
