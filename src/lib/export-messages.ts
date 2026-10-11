import type { Message } from "@/model/user.model";

export type MessageExportFormat = "csv" | "json";

const DOUBLE_QUOTE_REGEX = /"/g;

const escapeCsvCell = (value: string): string =>
  `"${value.replace(DOUBLE_QUOTE_REGEX, '""')}"`;

export function buildMessagesCsv(messages: Message[]): string {
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

export function buildMessagesJson(messages: Message[]): string {
  return JSON.stringify(messages, null, 2);
}

/** Triggers a browser download of the given messages as CSV or JSON. */
export function downloadMessages(
  messages: Message[],
  format: MessageExportFormat
): void {
  const href =
    format === "csv"
      ? `data:text/csv;charset=utf-8,${encodeURIComponent(buildMessagesCsv(messages))}`
      : `data:text/json;charset=utf-8,${encodeURIComponent(buildMessagesJson(messages))}`;

  const anchor = document.createElement("a");
  anchor.setAttribute("href", href);
  anchor.setAttribute("download", `ghostmsg-export-${Date.now()}.${format}`);
  anchor.click();
}
