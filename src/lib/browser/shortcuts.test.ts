import { afterEach, describe, expect, it } from "vitest";
import { shouldIgnoreShortcut } from "./shortcuts";

const keydown = (
  init: KeyboardEventInit,
  target: EventTarget = document.body
): KeyboardEvent => {
  const event = new KeyboardEvent("keydown", { bubbles: true, ...init });
  Object.defineProperty(event, "target", { value: target });
  return event;
};

describe("shouldIgnoreShortcut", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("allows plain and Shift keys on the page", () => {
    expect(shouldIgnoreShortcut(keydown({ key: "j" }))).toBe(false);
    expect(shouldIgnoreShortcut(keydown({ key: "B", shiftKey: true }))).toBe(
      false
    );
  });

  it("ignores ⌘, Ctrl and Alt combinations", () => {
    expect(shouldIgnoreShortcut(keydown({ key: "k", metaKey: true }))).toBe(
      true
    );
    expect(shouldIgnoreShortcut(keydown({ ctrlKey: true, key: "s" }))).toBe(
      true
    );
    expect(shouldIgnoreShortcut(keydown({ altKey: true, key: "e" }))).toBe(
      true
    );
  });

  it("ignores keys typed into fields", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    expect(shouldIgnoreShortcut(keydown({ key: "s" }, input))).toBe(true);
    expect(shouldIgnoreShortcut(keydown({ key: "s" }, textarea))).toBe(true);
  });

  it("ignores keys while a dialog is open", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    document.body.append(dialog);
    expect(shouldIgnoreShortcut(keydown({ key: "e" }))).toBe(true);
  });
});
