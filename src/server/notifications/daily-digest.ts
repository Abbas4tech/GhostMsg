import "server-only";
import type { SentimentTag } from "@/server/models/message.model";
import type { QuietHours } from "@/server/models/user.model";
import { buildAlertPreview, isWithinQuietHours } from "./delivery-policy";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
/** A first digest covers the last day; a long gap never reaches past a week. */
const FIRST_WINDOW_MS = DAY_MS;
const MAX_WINDOW_MS = 7 * DAY_MS;
export const DIGEST_PREVIEW_COUNT = 3;

export interface DigestRecipient {
  email: string;
  hideMessageText: boolean;
  id: string;
  lastDigestSentAt?: Date | null;
  quietHours?: QuietHours;
  username: string;
}

export interface DigestMessage {
  content: string;
  sentimentTag: SentimentTag;
}

export interface DigestSummary {
  /** Empty when the recipient hides message text. */
  previews: { sentimentTag: SentimentTag; text: string }[];
  total: number;
}

export interface DailyDigestDeps {
  /** Non-quarantined messages after `since`: the count and the newest few. */
  loadNewMessages: (
    recipientId: string,
    since: Date
  ) => Promise<{ recent: DigestMessage[]; total: number }>;
  /** Recipients with `emailAlerts: "daily"`. */
  loadRecipients: () => Promise<DigestRecipient[]>;
  markSent: (recipientId: string, at: Date) => Promise<void>;
  /** Resolves true when the email was accepted by the mail server. */
  sendDigest: (
    recipient: DigestRecipient,
    summary: DigestSummary
  ) => Promise<boolean>;
}

export interface DailyDigestResult {
  considered: number;
  empty: number;
  failed: number;
  sent: number;
  skippedQuietHours: number;
}

/** Start of the window a digest covers: since the last digest, at most a week. */
export function digestWindowStart(
  lastDigestSentAt: Date | null | undefined,
  now: Date
): Date {
  const floor = now.getTime() - MAX_WINDOW_MS;
  const start = lastDigestSentAt
    ? lastDigestSentAt.getTime()
    : now.getTime() - FIRST_WINDOW_MS;
  return new Date(Math.max(start, floor));
}

/** What a digest may show: always the count, text only if not hidden. */
export function buildDigestSummary(
  total: number,
  recent: DigestMessage[],
  hideMessageText: boolean
): DigestSummary {
  return {
    total,
    previews: hideMessageText
      ? []
      : recent.slice(0, DIGEST_PREVIEW_COUNT).map((message) => ({
          text: buildAlertPreview(message.content, false),
          sentimentTag: message.sentimentTag,
        })),
  };
}

/**
 * One digest run (ADR 0029). For each "daily" recipient: skip inside quiet
 * hours (messages roll into the next run), skip when nothing new arrived,
 * otherwise email a summary and move the window forward. A failed send keeps
 * the window so the next run retries. Quarantined messages are never counted.
 */
export async function runDailyDigest(
  deps: DailyDigestDeps,
  now: Date = new Date()
): Promise<DailyDigestResult> {
  const result: DailyDigestResult = {
    considered: 0,
    sent: 0,
    empty: 0,
    skippedQuietHours: 0,
    failed: 0,
  };

  const recipients = await deps.loadRecipients();
  for (const recipient of recipients) {
    result.considered += 1;
    if (isWithinQuietHours(now, recipient.quietHours)) {
      result.skippedQuietHours += 1;
      continue;
    }
    try {
      const since = digestWindowStart(recipient.lastDigestSentAt, now);
      const { total, recent } = await deps.loadNewMessages(recipient.id, since);
      if (total === 0) {
        result.empty += 1;
        continue;
      }
      const summary = buildDigestSummary(
        total,
        recent,
        recipient.hideMessageText
      );
      if (await deps.sendDigest(recipient, summary)) {
        await deps.markSent(recipient.id, now);
        result.sent += 1;
      } else {
        result.failed += 1;
      }
    } catch (error) {
      console.warn("Daily digest failed for a recipient:", error);
      result.failed += 1;
    }
  }
  return result;
}
