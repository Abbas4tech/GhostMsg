import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { PALETTE_STORAGE_KEY } from "@/lib/theme/palette";
import PaletteProvider, { usePalette } from "./palette-provider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaletteProvider>{children}</PaletteProvider>
);

const storageEvent = (newValue: string | null, key = PALETTE_STORAGE_KEY) =>
  new StorageEvent("storage", { key, newValue });

describe("PaletteProvider", () => {
  afterEach(() => {
    document.documentElement.dataset.palette = "spectral";
    localStorage.clear();
  });

  it("stores and applies a chosen palette", () => {
    const { result } = renderHook(() => usePalette(), { wrapper });

    act(() => result.current.setPalette("midnight"));

    expect(result.current.palette).toBe("midnight");
    expect(document.documentElement.dataset.palette).toBe("midnight");
    expect(localStorage.getItem(PALETTE_STORAGE_KEY)).toBe("midnight");
  });

  it("follows a palette chosen in another tab", () => {
    const { result } = renderHook(() => usePalette(), { wrapper });

    act(() => {
      window.dispatchEvent(storageEvent("paper"));
    });

    expect(result.current.palette).toBe("paper");
    expect(document.documentElement.dataset.palette).toBe("paper");
  });

  it("ignores other keys and unknown palettes", () => {
    const { result } = renderHook(() => usePalette(), { wrapper });

    act(() => {
      window.dispatchEvent(storageEvent("paper", "something-else"));
      window.dispatchEvent(storageEvent("neon"));
    });

    expect(result.current.palette).toBe("spectral");
  });
});
