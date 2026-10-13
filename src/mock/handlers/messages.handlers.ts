import { HttpResponse, http } from "msw";
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

const success = (message: string) => ({ success: true, message });

/** Inbox list + every inbox mutation, answering with the given dataset. */
export const inboxHandlers = (
  messages: MessageFixture[],
  options: ScenarioOptions = {}
) => [
  http.get(mswPath("/api/get-messages"), async () => {
    await applyLatency(options);
    return ok("/api/get-messages", "get", {
      success: true,
      messages,
      total: messages.length,
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
    mixed: inboxHandlers(messageScenarios.mixed),
    empty: inboxHandlers(messageScenarios.empty),
    allQuarantined: inboxHandlers(messageScenarios.allQuarantined),
    longContent: inboxHandlers(messageScenarios.longContent),
    loading: inboxHandlers(messageScenarios.mixed, { latency: "infinite" }),
    error: [
      http.get(mswPath("/api/get-messages"), () =>
        apiError(500, "Failed to fetch messages")
      ),
    ],
  },
};
