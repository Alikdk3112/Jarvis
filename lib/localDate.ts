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
