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
  return then.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

const plural = (count: number, unit: string): string =>
  `${count} ${unit}${count === 1 ? "" : "s"} ago`;

/**
 * Inbox subtitle wording (design Inbox: "3 unread · last checked a moment
 * ago"): "a moment ago", "5 minutes ago", "2 hours ago", then "on Mar 4".
 */
export function formatLastChecked(
  date: number | string | Date,
  now: Date = new Date()
): string {
  const then = new Date(date);
  const seconds = Math.max(
    0,
    Math.round((now.getTime() - then.getTime()) / 1000)
  );
  if (seconds < MINUTE) {
    return "a moment ago";
  }
  if (seconds < HOUR) {
    return plural(Math.floor(seconds / MINUTE), "minute");
  }
  if (seconds < DAY) {
    return plural(Math.floor(seconds / HOUR), "hour");
  }
  return `on ${then.toLocaleDateString("en-US", { day: "numeric", month: "short" })}`;
}
