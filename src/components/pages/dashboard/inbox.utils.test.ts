import { describe, expect, it } from "vitest";
import {
  curiousMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import {
  buildInboxHref,
  CLOSED_INBOX_MODAL,
  isFilterStatus,
  moveFocus,
  resolveInboxShortcut,
  resolveModalMessage,
  toggleScopedSelection,
  visibleSelection,
} from "./inbox.utils";

describe("isFilterStatus", () => {
  it("accepts known filters and rejects anything else", () => {
    expect(isFilterStatus("starred")).toBe(true);
    expect(isFilterStatus("archived")).toBe(true);
    expect(isFilterStatus("trash")).toBe(false);
    expect(isFilterStatus(undefined)).toBe(false);
  });
});

describe("resolveInboxShortcut", () => {
  it("maps the design keyboard map", () => {
    expect(resolveInboxShortcut("j")).toBe("next");
    expect(resolveInboxShortcut("ArrowDown")).toBe("next");
    expect(resolveInboxShortcut("k")).toBe("prev");
    expect(resolveInboxShortcut("ArrowUp")).toBe("prev");
    expect(resolveInboxShortcut("J")).toBe("extend-next");
    expect(resolveInboxShortcut("K")).toBe("extend-prev");
    expect(resolveInboxShortcut("x")).toBe("select");
    expect(resolveInboxShortcut("s")).toBe("star");
    expect(resolveInboxShortcut("r")).toBe("reply");
    expect(resolveInboxShortcut("e")).toBe("archive");
    expect(resolveInboxShortcut("#")).toBe("delete");
    expect(resolveInboxShortcut("B")).toBe("block");
    expect(resolveInboxShortcut("/")).toBe("search");
    expect(resolveInboxShortcut("Escape")).toBe("clear-selection");
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

describe("buildInboxHref", () => {
  it("leaves out the default filter and an empty search", () => {
    expect(buildInboxHref("/dashboard", "all", "  ")).toBe("/dashboard");
  });

  it("writes the filter and the trimmed search", () => {
    expect(buildInboxHref("/dashboard", "unread", " hi there ")).toBe(
      "/dashboard?filter=unread&q=hi+there"
    );
    expect(buildInboxHref("/dashboard", "all", "hi")).toBe("/dashboard?q=hi");
  });
});

describe("toggleScopedSelection", () => {
  const empty = { ids: [], scope: "all|" };

  it("adds and removes ids within one scope", () => {
    const one = toggleScopedSelection(empty, "all|", "a");
    const two = toggleScopedSelection(one, "all|", "b");
    expect(two).toEqual({ ids: ["a", "b"], scope: "all|" });
    expect(toggleScopedSelection(two, "all|", "a")).toEqual({
      ids: ["b"],
      scope: "all|",
    });
  });

  it("starts over when the scope changed", () => {
    const selection = { ids: ["a", "b"], scope: "all|" };
    expect(toggleScopedSelection(selection, "unread|", "c")).toEqual({
      ids: ["c"],
      scope: "unread|",
    });
  });
});

describe("visibleSelection", () => {
  const selection = { ids: ["a", "b"], scope: "all|" };

  it("keeps only loaded ids from the current scope", () => {
    expect(visibleSelection(selection, "all|", new Set(["b", "c"]))).toEqual([
      "b",
    ]);
  });

  it("is empty for another scope", () => {
    expect(visibleSelection(selection, "unread|", new Set(["a", "b"]))).toEqual(
      []
    );
  });
});

describe("resolveModalMessage", () => {
  const id = String(sweetMessage._id);

  it("is null while no message is targeted", () => {
    expect(resolveModalMessage(CLOSED_INBOX_MODAL, [sweetMessage])).toBeNull();
  });

  it("prefers the live cached copy over the snapshot", () => {
    const live = { ...sweetMessage, isStarred: true };
    const modal = {
      kind: "reply" as const,
      messageId: id,
      snapshot: sweetMessage,
    };
    expect(resolveModalMessage(modal, [curiousMessage, live])).toBe(live);
  });

  it("falls back to the snapshot once the message is gone", () => {
    const modal = { kind: null, messageId: id, snapshot: sweetMessage };
    expect(resolveModalMessage(modal, [curiousMessage])).toBe(sweetMessage);
  });
});
