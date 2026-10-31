import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  curiousMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { useInboxKeyboardController } from "./use-inbox-keyboard.controller";

const press = (key: string) =>
  window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key }));

function setup(focusedId: string | null = null) {
  const options = {
    focusedId,
    messages: [sweetMessage, curiousMessage],
    onArchive: vi.fn(),
    onBlock: vi.fn(),
    onClearSelection: vi.fn(),
    onDelete: vi.fn(),
    onOpenReply: vi.fn(),
    onStarToggle: vi.fn(),
    onToggleSelect: vi.fn(),
    searchInputId: "inbox-search",
    selectedIds: [] as string[],
    setFocusedId: vi.fn(),
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

  it("archives, deletes (via the confirm) and blocks the focused message", () => {
    const options = setup(String(sweetMessage._id));
    press("e");
    press("#");
    press("B");
    expect(options.onArchive).toHaveBeenCalledWith(sweetMessage);
    expect(options.onDelete).toHaveBeenCalledWith(sweetMessage);
    expect(options.onBlock).toHaveBeenCalledWith(sweetMessage);
  });

  it("moves with the arrow keys and extends the selection with shift", () => {
    const options = setup(String(sweetMessage._id));
    press("ArrowDown");
    expect(options.setFocusedId).toHaveBeenCalledWith(
      String(curiousMessage._id)
    );
    press("J");
    expect(options.onToggleSelect).toHaveBeenCalledWith(
      String(sweetMessage._id)
    );
    expect(options.onToggleSelect).toHaveBeenCalledWith(
      String(curiousMessage._id)
    );
  });

  it("clears the selection on escape", () => {
    const options = setup();
    press("Escape");
    expect(options.onClearSelection).toHaveBeenCalled();
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
