import type { MessageDto } from "@/types/api";

export type MessageExportFormat = "csv" | "json";

const DOUBLE_QUOTE_REGEX = /"/g;

const escapeCsvCell = (value: string): string =>
  `"${value.replace(DOUBLE_QUOTE_REGEX, '""')}"`;

const MIME_TYPES: Record<MessageExportFormat, string> = {
  csv: "text/csv",
  json: "text/json",
};

/** CSV with a header row; content and reply cells are quoted and escaped. */
export function buildMessagesCsv(messages: MessageDto[]): string {
  const headers = ["ID", "Content", "Sentiment", "Created At", "Reply"];
  const rows = messages.map((m) => [
    String(m._id),
    escapeCsvCell(m.content),
    m.sentimentTag || "neutral",
    new Date(m.createdAt).toISOString(),
    m.reply?.text ? escapeCsvCell(m.reply.text) : '""',
  ]);
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * One exported message. Deliberately an allow-list: the Sender Hash and any
 * future server-only field never reach a file the recipient might share.
 */
export interface MessageExportRecord {
  content: string;
  createdAt: string;
  id: string;
  isPinned: boolean;
  isQuarantined: boolean;
  isRead: boolean;
  reply: { isPublished: boolean; publishedAt?: string; text: string } | null;
  sentimentTag: string;
}

export function toMessageExportRecord(m: MessageDto): MessageExportRecord {
  return {
    content: m.content,
    createdAt: new Date(m.createdAt).toISOString(),
    id: String(m._id),
    isPinned: Boolean(m.isPinned),
    isQuarantined: Boolean(m.isQuarantined),
    isRead: Boolean(m.isRead),
    reply: m.reply?.text
      ? {
          isPublished: Boolean(m.reply.isPublished),
          text: m.reply.text,
          ...(m.reply.publishedAt ? { publishedAt: m.reply.publishedAt } : {}),
        }
      : null,
    sentimentTag: m.sentimentTag || "neutral",
  };
}

/** Pretty-printed JSON array of export records (no Sender Hashes). */
export function buildMessagesJson(messages: MessageDto[]): string {
  return JSON.stringify(messages.map(toMessageExportRecord), null, 2);
}

export interface MessageExportFile {
  content: string;
  filename: string;
  mimeType: string;
}

/** Builds the export payload (content + filename + MIME type) without side effects. */
export function buildMessagesExport(
  messages: MessageDto[],
  format: MessageExportFormat,
  timestamp: number = Date.now()
): MessageExportFile {
  return {
    content:
      format === "csv"
        ? buildMessagesCsv(messages)
        : buildMessagesJson(messages),
    filename: `ghostmsg-export-${timestamp}.${format}`,
    mimeType: MIME_TYPES[format],
  };
}
