import { describe, expect, it } from "vitest";
import { isFilterStatus, moveFocus, resolveInboxShortcut } from "./inbox.utils";

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
