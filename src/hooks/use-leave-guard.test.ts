import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useLeaveGuard } from "./use-leave-guard";

function clickLink(href: string, init: MouseEventInit = {}) {
  const anchor = document.createElement("a");
  anchor.href = href;
  document.body.append(anchor);
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: 0,
    ...init,
  });
  anchor.dispatchEvent(event);
  anchor.remove();
  return event;
}

describe("useLeaveGuard", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("holds an in-app link while there are unsaved changes", () => {
    const { result } = renderHook(() => useLeaveGuard(true));

    let event: MouseEvent | undefined;
    act(() => {
      event = clickLink("/dashboard/settings");
    });

    expect(event?.defaultPrevented).toBe(true);
    expect(result.current.pendingHref).toBe("/dashboard/settings");

    act(() => result.current.clearPendingHref());
    expect(result.current.pendingHref).toBeNull();
  });

  it("lets links through when nothing is unsaved", () => {
    const { result } = renderHook(() => useLeaveGuard(false));

    let event: MouseEvent | undefined;
    act(() => {
      event = clickLink("/dashboard/settings");
    });

    expect(event?.defaultPrevented).toBe(false);
    expect(result.current.pendingHref).toBeNull();
  });

  it("ignores new-tab clicks, other origins and same-page anchors", () => {
    const { result } = renderHook(() => useLeaveGuard(true));

    act(() => {
      clickLink("/dashboard/settings", { metaKey: true });
      clickLink("https://example.com/elsewhere");
      clickLink(`${window.location.pathname}#identity`);
    });

    expect(result.current.pendingHref).toBeNull();
  });

  it("asks the browser to confirm closing the tab", () => {
    renderHook(() => useLeaveGuard(true));
    const event = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
