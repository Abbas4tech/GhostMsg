import { afterEach, describe, expect, it, vi } from "vitest";
import { runWhenIdle } from "./idle";

describe("runWhenIdle", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("uses requestIdleCallback when available and can cancel", () => {
    const request = vi.fn().mockReturnValue(7);
    const cancel = vi.fn();
    vi.stubGlobal("requestIdleCallback", request);
    vi.stubGlobal("cancelIdleCallback", cancel);
    const callback = vi.fn();

    const stop = runWhenIdle(callback);
    expect(request).toHaveBeenCalledWith(callback, { timeout: 2000 });

    stop();
    expect(cancel).toHaveBeenCalledWith(7);
  });

  it("falls back to a short timeout without requestIdleCallback", () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestIdleCallback", undefined);
    const callback = vi.fn();

    runWhenIdle(callback);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledOnce();
  });

  it("does not run a cancelled fallback", () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestIdleCallback", undefined);
    const callback = vi.fn();

    runWhenIdle(callback)();
    vi.advanceTimersByTime(500);

    expect(callback).not.toHaveBeenCalled();
  });
});
