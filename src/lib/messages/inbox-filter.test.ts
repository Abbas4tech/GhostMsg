import { describe, expect, it } from "vitest";
import {
  answeredSpicyMessage,
  buildMessage,
  messageScenarios,
  mixedMessageCounts,
  quarantinedMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import {
  countInboxStatuses,
  EMPTY_INBOX_COUNTS,
  hasReplyText,
  isInboxQueryStatus,
  isInboxStatus,
  matchesInboxSearch,
  matchesInboxStatus,
} from "./inbox-filter";

describe("hasReplyText", () => {
  it("is false for missing or whitespace-only replies", () => {
    expect(hasReplyText(sweetMessage)).toBe(false);
    expect(
      hasReplyText(buildMessage({ reply: { isPublished: false, text: "   " } }))
    ).toBe(false);
    expect(hasReplyText(answeredSpicyMessage)).toBe(true);
  });
});

describe("matchesInboxStatus", () => {
  it("hides quarantined messages from 'all' and 'unread'", () => {
    expect(matchesInboxStatus(quarantinedMessage, "all")).toBe(false);
    expect(matchesInboxStatus(quarantinedMessage, "unread")).toBe(false);
    expect(matchesInboxStatus(quarantinedMessage, "quarantined")).toBe(true);
  });

  it("matches unread, starred and answered", () => {
    expect(matchesInboxStatus(sweetMessage, "unread")).toBe(true);
    expect(matchesInboxStatus(answeredSpicyMessage, "starred")).toBe(true);
    expect(matchesInboxStatus(answeredSpicyMessage, "answered")).toBe(true);
    expect(matchesInboxStatus(sweetMessage, "answered")).toBe(false);
  });

  it("matches everything for the API-only 'any' status", () => {
    expect(matchesInboxStatus(quarantinedMessage, "any")).toBe(true);
    expect(matchesInboxStatus(sweetMessage, "any")).toBe(true);
  });
});

describe("matchesInboxSearch", () => {
  it("matches content or reply text, case-insensitively", () => {
    expect(matchesInboxSearch(answeredSpicyMessage, "CONTROVERSIAL")).toBe(
      true
    );
    expect(matchesInboxSearch(answeredSpicyMessage, "minimalist")).toBe(true);
    expect(matchesInboxSearch(sweetMessage, "nope")).toBe(false);
  });

  it("treats a blank query as a match", () => {
    expect(matchesInboxSearch(sweetMessage, "   ")).toBe(true);
  });
});

describe("countInboxStatuses", () => {
  it("counts the mixed scenario per status plus the total", () => {
    expect(countInboxStatuses(messageScenarios.mixed)).toEqual(
      mixedMessageCounts
    );
  });

  it("returns zeros for an empty inbox", () => {
    expect(countInboxStatuses([])).toEqual(EMPTY_INBOX_COUNTS);
  });
});

describe("status guards", () => {
  it("accepts inbox filters, and 'any' only as a query status", () => {
    expect(isInboxStatus("starred")).toBe(true);
    expect(isInboxStatus("any")).toBe(false);
    expect(isInboxQueryStatus("any")).toBe(true);
    expect(isInboxQueryStatus("everything")).toBe(false);
  });
});
