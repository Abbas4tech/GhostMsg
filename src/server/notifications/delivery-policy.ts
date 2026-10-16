import "server-only";
import type { QuietHours } from "@/server/models/user.model";

const MINUTES_PER_HOUR = 60;
const ALERT_PREVIEW_LENGTH = 80;
export const HIDDEN_ALERT_TEXT = "New Anonymous Message";

const toMinutes = (clock: string): number => {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
};

/** Minutes since midnight of `date` in `timeZone` (falls back to UTC). */
function minutesInZone(date: Date, timeZone: string): number {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);
  } catch {
    return date.getUTCHours() * MINUTES_PER_HOUR + date.getUTCMinutes();
  }
  const read = (type: "hour" | "minute"): number =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return read("hour") * MINUTES_PER_HOUR + read("minute");
}

/**
 * True inside the recipient's quiet window. Windows may cross midnight
 * (22:00 → 08:00). A zero-length window is treated as off.
 */
export function isWithinQuietHours(
  date: Date,
  quietHours: QuietHours | undefined
): boolean {
  if (!quietHours?.enabled) {
    return false;
  }
  const start = toMinutes(quietHours.start);
  const end = toMinutes(quietHours.end);
  if (start === end) {
    return false;
  }
  const now = minutesInZone(date, quietHours.timeZone);
  return start < end ? now >= start && now < end : now >= start || now < end;
}

/** Push / email preview: the message text, or a neutral line when hidden. */
export function buildAlertPreview(content: string, hideText: boolean): string {
  if (hideText) {
    return HIDDEN_ALERT_TEXT;
  }
  return content.length > ALERT_PREVIEW_LENGTH
    ? `${content.slice(0, ALERT_PREVIEW_LENGTH)}…`
    : content;
}
