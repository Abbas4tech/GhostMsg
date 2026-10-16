import { api, clientFetch } from "@/data/api-client";
import type { InboxQueryStatus } from "@/lib/messages/inbox-filter";
import type { MessageDto } from "@/types/api";

const EXPORT_PAGE_SIZE = 100;
/** Safety stop: 200 pages × 100 = 20,000 messages. */
const MAX_PAGES = 200;

/**
 * Every message for a status by walking the server's pages ("Export all").
 * Bypasses the inbox cache so an export never depends on what was scrolled.
 */
export async function fetchAllMessages(
  status: InboxQueryStatus = "any"
): Promise<MessageDto[]> {
  const messages: MessageDto[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await clientFetch(
      api.GET("/api/get-messages", {
        params: {
          query: { cursor, limit: String(EXPORT_PAGE_SIZE), status },
        },
      })
    );
    messages.push(...result.messages);
    cursor = result.nextCursor ?? undefined;
    if (!cursor) {
      break;
    }
  }
  return messages;
}
