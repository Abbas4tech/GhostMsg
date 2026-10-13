const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * Compact age for inbox rows: "now", "2m", "3h", "4d", then a short date
 * ("Mar 4"). `now` is injectable so tests and stories are deterministic.
 */
export function formatRelativeTime(
  date: string | Date,
  now: Date = new Date()
): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.max(
    0,
    Math.round((now.getTime() - then.getTime()) / 1000)
  );

  if (seconds < MINUTE) {
    return "now";
  }
  if (seconds < HOUR) {
    return `${Math.floor(seconds / MINUTE)}m`;
  }
  if (seconds < DAY) {
    return `${Math.floor(seconds / HOUR)}h`;
  }
  if (seconds < WEEK) {
    return `${Math.floor(seconds / DAY)}d`;
  }
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
