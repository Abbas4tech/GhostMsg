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
  isFilterStatus,
  matchesSearch,
  matchesStatus,
  moveFocus,
  resolveInboxShortcut,
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

describe("isFilterStatus", () => {
  it("accepts known filters and rejects anything else", () => {
    expect(isFilterStatus("starred")).toBe(true);
    expect(isFilterStatus("archived")).toBe(false);
    expect(isFilterStatus(undefined)).toBe(false);
  });
});

describe("resolveInboxShortcut", () => {
  it("maps j/k/x/s/r and slash", () => {
    expect(resolveInboxShortcut("j")).toBe("next");
    expect(resolveInboxShortcut("k")).toBe("prev");
    expect(resolveInboxShortcut("x")).toBe("select");
    expect(resolveInboxShortcut("s")).toBe("star");
    expect(resolveInboxShortcut("r")).toBe("reply");
    expect(resolveInboxShortcut("/")).toBe("search");
    expect(resolveInboxShortcut("q")).toBeNull();
  });
});

describe("moveFocus", () => {
  const ids = ["a", "b", "c"];

  it("starts at the first message", () => {
    expect(moveFocus(ids, null, 1)).toBe("a");
  });

  it("moves and clamps at both ends", () => {
    expect(moveFocus(ids, "a", 1)).toBe("b");
    expect(moveFocus(ids, "c", 1)).toBe("c");
    expect(moveFocus(ids, "a", -1)).toBe("a");
  });

  it("recovers when the focused message is gone", () => {
    expect(moveFocus(ids, "zzz", -1)).toBe("a");
    expect(moveFocus([], "a", 1)).toBeNull();
  });
});
