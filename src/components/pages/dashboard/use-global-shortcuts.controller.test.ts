import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CHORD_WINDOW_MS,
  useGlobalShortcutsController,
} from "./use-global-shortcuts.controller";

const press = (key: string, init: KeyboardEventInit = {}) =>
  window.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key, ...init })
  );

function setup() {
  const options = {
    onCopyLink: vi.fn(),
    onNavigate: vi.fn(),
    onOpenShortcuts: vi.fn(),
  };
  renderHook(() => useGlobalShortcutsController(options));
  return options;
}

describe("useGlobalShortcutsController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("jumps with g i, g p and g s", () => {
    const options = setup();
    press("g");
    press("p");
    expect(options.onNavigate).toHaveBeenLastCalledWith("/dashboard/profile");
    press("g");
    press("s");
    expect(options.onNavigate).toHaveBeenLastCalledWith("/dashboard/settings");
    press("g");
    press("i");
    expect(options.onNavigate).toHaveBeenLastCalledWith("/dashboard");
  });

  it("drops a chord after the window", () => {
    const options = setup();
    press("g");
    vi.advanceTimersByTime(CHORD_WINDOW_MS + 1);
    press("s");
    expect(options.onNavigate).not.toHaveBeenCalled();
  });

  it("stops the chord key reaching other listeners (no star on g s)", () => {
    setup();
    const inboxListener = vi.fn();
    window.addEventListener("keydown", inboxListener);
    press("g");
    press("s");
    window.removeEventListener("keydown", inboxListener);
    expect(inboxListener).not.toHaveBeenCalled();
  });

  it("copies the link with ⇧C and opens the sheet with ?", () => {
    const options = setup();
    press("C", { shiftKey: true });
    expect(options.onCopyLink).toHaveBeenCalledOnce();
    press("?", { shiftKey: true });
    expect(options.onOpenShortcuts).toHaveBeenCalledOnce();
  });

  it("ignores keys while a dialog is open", () => {
    const options = setup();
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    document.body.append(dialog);
    press("?", { shiftKey: true });
    expect(options.onOpenShortcuts).not.toHaveBeenCalled();
  });
});
