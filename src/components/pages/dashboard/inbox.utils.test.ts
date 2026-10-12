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
  countByStatus,
  hasReplyText,
  matchesSearch,
  matchesStatus,
} from "./inbox.utils";

describe("hasReplyText", () => {
  it("is false for missing or whitespace-only replies", () => {
    expect(hasReplyText(sweetMessage)).toBe(false);
    expect(
      hasReplyText(buildMessage({ reply: { text: "   ", isPublished: false } }))
    ).toBe(false);
    expect(hasReplyText(answeredSpicyMessage)).toBe(true);
  });
});

describe("matchesStatus", () => {
  it("hides quarantined messages from 'all' and 'unread'", () => {
    expect(matchesStatus(quarantinedMessage, "all")).toBe(false);
    expect(matchesStatus(quarantinedMessage, "unread")).toBe(false);
    expect(matchesStatus(quarantinedMessage, "quarantined")).toBe(true);
  });

  it("matches unread, starred and answered", () => {
    expect(matchesStatus(sweetMessage, "unread")).toBe(true);
    expect(matchesStatus(answeredSpicyMessage, "starred")).toBe(true);
    expect(matchesStatus(answeredSpicyMessage, "answered")).toBe(true);
    expect(matchesStatus(sweetMessage, "answered")).toBe(false);
  });
});

describe("matchesSearch", () => {
  it("matches content or reply text, case-insensitively", () => {
    expect(matchesSearch(answeredSpicyMessage, "CONTROVERSIAL")).toBe(true);
    expect(matchesSearch(answeredSpicyMessage, "minimalist")).toBe(true);
    expect(matchesSearch(sweetMessage, "nope")).toBe(false);
  });

  it("treats a blank query as a match", () => {
    expect(matchesSearch(sweetMessage, "   ")).toBe(true);
  });
});

describe("countByStatus", () => {
  it("counts the mixed scenario per status", () => {
    expect(countByStatus(messageScenarios.mixed)).toEqual(mixedMessageCounts);
  });

  it("returns zeros for an empty inbox", () => {
    expect(countByStatus([])).toEqual({
      all: 0,
      unread: 0,
      starred: 0,
      quarantined: 0,
      answered: 0,
    });
  });
});
