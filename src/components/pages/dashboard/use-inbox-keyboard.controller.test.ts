import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  curiousMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { useInboxKeyboardController } from "./use-inbox-keyboard.controller";

const press = (key: string) =>
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

function setup(focusedId: string | null = null) {
  const options = {
    messages: [sweetMessage, curiousMessage],
    focusedId,
    setFocusedId: vi.fn(),
    onToggleSelect: vi.fn(),
    onStarToggle: vi.fn(),
    onOpenReply: vi.fn(),
    searchInputId: "inbox-search",
  };
  renderHook(() => useInboxKeyboardController(options));
  return options;
}

describe("useInboxKeyboardController", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("moves the cursor with j and k", () => {
    const options = setup(String(sweetMessage._id));
    press("j");
    expect(options.setFocusedId).toHaveBeenCalledWith(
      String(curiousMessage._id)
    );
    press("k");
    expect(options.setFocusedId).toHaveBeenLastCalledWith(
      String(sweetMessage._id)
    );
  });

  it("selects, stars and replies to the focused message", () => {
    const options = setup(String(sweetMessage._id));
    press("x");
    press("s");
    press("r");
    expect(options.onToggleSelect).toHaveBeenCalledWith(
      String(sweetMessage._id)
    );
    expect(options.onStarToggle).toHaveBeenCalledWith(sweetMessage);
    expect(options.onOpenReply).toHaveBeenCalledWith(sweetMessage);
  });

  it("focuses search on slash", () => {
    const input = document.createElement("input");
    input.id = "inbox-search";
    document.body.append(input);
    setup();
    press("/");
    expect(document.activeElement).toBe(input);
  });

  it("ignores keys while a dialog is open", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    document.body.append(dialog);
    const options = setup(String(sweetMessage._id));
    press("j");
    expect(options.setFocusedId).not.toHaveBeenCalled();
  });
});
