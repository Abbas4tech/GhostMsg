import { HttpResponse, http } from "msw";
import {
  compareNewestFirst,
  decodeInboxCursor,
  encodeInboxCursor,
  isAfterCursor,
} from "@/lib/messages/inbox-cursor";
import {
  countInboxStatuses,
  isInboxQueryStatus,
  matchesInboxSearch,
  matchesInboxStatus,
} from "@/lib/messages/inbox-filter";
import {
  type MessageFixture,
  messageScenarios,
} from "@/mock/fixtures/messages.fixtures";
import {
  apiError,
  applyLatency,
  mswPath,
  ok,
  type ScenarioOptions,
} from "./utils";

const success = (message: string) => ({ message, success: true });

const DEFAULT_PAGE_SIZE = 30;

/**
 * One inbox page exactly as the server builds it: status filter, search on
 * content or answer, newest first, keyset cursor (shared rules in
 * `src/lib/messages/inbox-filter.ts` and `inbox-cursor.ts`).
 */
function inboxPage(messages: MessageFixture[], url: URL) {
  const statusParam = url.searchParams.get("status") ?? "all";
  const status = isInboxQueryStatus(statusParam) ? statusParam : "all";
  const q = url.searchParams.get("q") ?? "";
  const limit = Number(url.searchParams.get("limit")) || DEFAULT_PAGE_SIZE;
  const cursor = decodeInboxCursor(url.searchParams.get("cursor"));

  const matching = messages
    .filter(
      (message) =>
        matchesInboxStatus(message, status) && matchesInboxSearch(message, q)
    )
    .sort(compareNewestFirst);
  const remaining = cursor
    ? matching.filter((message) => isAfterCursor(message, cursor))
    : matching;
  const page = remaining.slice(0, limit);
  const last = page.at(-1);

  return {
    messages: page,
    nextCursor:
      remaining.length > limit && last ? encodeInboxCursor(last) : null,
    success: true,
    total: matching.length,
  };
}

/** Inbox list, counts and every inbox mutation, answering with the dataset. */
export const inboxHandlers = (
  messages: MessageFixture[],
  options: ScenarioOptions = {}
) => [
  http.get(mswPath("/api/get-messages"), async ({ request }) => {
    await applyLatency(options);
    return ok(
      "/api/get-messages",
      "get",
      inboxPage(messages, new URL(request.url))
    );
  }),
  http.get(mswPath("/api/messages/counts"), async () => {
    await applyLatency(options);
    return ok("/api/messages/counts", "get", {
      counts: countInboxStatuses(messages),
      success: true,
    });
  }),
  http.patch(mswPath("/api/messages/{messageId}"), () =>
    HttpResponse.json(success("Message updated"))
  ),
  http.delete(mswPath("/api/delete-message/{messageId}"), () =>
    HttpResponse.json(success("Message deleted"))
  ),
  http.post(mswPath("/api/messages/{messageId}/reply"), () =>
    HttpResponse.json(success("Reply saved"))
  ),
  http.post(mswPath("/api/messages/bulk"), () =>
    HttpResponse.json(success("Bulk action applied"))
  ),
  // Live updates: keep the SSE stream open without emitting events.
  http.get("/api/messages/stream", () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(": connected\n\n"));
      },
    });
    return new HttpResponse(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  }),
];

export const messageHandlers = {
  inbox: {
    allQuarantined: inboxHandlers(messageScenarios.allQuarantined),
    empty: inboxHandlers(messageScenarios.empty),
    error: [
      http.get(mswPath("/api/get-messages"), () =>
        apiError(500, "Failed to fetch messages")
      ),
      http.get(mswPath("/api/messages/counts"), () =>
        apiError(500, "Failed to count messages")
      ),
    ],
    loading: inboxHandlers(messageScenarios.mixed, { latency: "infinite" }),
    longContent: inboxHandlers(messageScenarios.longContent),
    mixed: inboxHandlers(messageScenarios.mixed),
  },
};
