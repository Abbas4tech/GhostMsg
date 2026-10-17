import { describe, expect, it } from "vitest";
import { buildMessage, fixtureDate } from "@/mock/fixtures/messages.fixtures";
import { inboxHandlers } from "@/mock/handlers/messages.handlers";
import { server } from "@/test/msw-server";
import { recordRequests } from "@/test/test-utils";
import { fetchAllMessages } from "./fetch-all-messages";

/** More messages than one export page (100), every tenth one quarantined. */
const MESSAGE_COUNT = 150;
const manyMessages = Array.from({ length: MESSAGE_COUNT }, (_, index) =>
  buildMessage({
    _id: `msg-${String(index).padStart(3, "0")}`,
    createdAt: fixtureDate(index),
    isQuarantined: index % 10 === 0,
  })
);

describe("fetchAllMessages", () => {
  it("walks every server page, quarantined messages included", async () => {
    server.use(...inboxHandlers(manyMessages));
    const requests = recordRequests();

    const messages = await fetchAllMessages();

    expect(messages).toHaveLength(MESSAGE_COUNT);
    expect(new Set(messages.map((message) => message._id)).size).toBe(
      MESSAGE_COUNT
    );
    expect(messages.some((message) => message.isQuarantined)).toBe(true);
    expect(
      requests.filter((request) => request === "GET /api/get-messages")
    ).toHaveLength(2);
  });

  it("asks for one status when given", async () => {
    server.use(...inboxHandlers(manyMessages));

    const messages = await fetchAllMessages("quarantined");

    expect(messages).toHaveLength(MESSAGE_COUNT / 10);
    expect(messages.every((message) => message.isQuarantined)).toBe(true);
  });
});
