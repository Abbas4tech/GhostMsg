import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useResendCooldownController } from "./use-resend-cooldown.controller";

describe("useResendCooldownController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down from the full cooldown once a second", () => {
    const { result } = renderHook(() => useResendCooldownController());
    expect(result.current.secondsLeft).toBe(60);

    act(() => {
      vi.advanceTimersByTime(18_000);
    });

    expect(result.current.secondsLeft).toBe(42);
  });

  it("stops at zero", () => {
    const { result } = renderHook(() => useResendCooldownController());

    act(() => {
      vi.advanceTimersByTime(75_000);
    });

    expect(result.current.secondsLeft).toBe(0);
  });

  it("restarts with the given wait", () => {
    const { result } = renderHook(() => useResendCooldownController());
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    act(() => {
      result.current.restart(42);
    });
    expect(result.current.secondsLeft).toBe(42);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.secondsLeft).toBe(40);
  });
});
