import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PALETTE,
  isPalette,
  PALETTE_BOOT_SCRIPT,
  PALETTE_META,
  PALETTE_STORAGE_KEY,
  PALETTES,
} from "./palette";

/** Executes the exact string the root layout ships in <head>. */
const runBootScript = (): void => {
  new Function(PALETTE_BOOT_SCRIPT)();
};

describe("isPalette", () => {
  it("accepts every known palette", () => {
    for (const palette of PALETTES) {
      expect(isPalette(palette)).toBe(true);
    }
  });

  it("rejects unknown values", () => {
    expect(isPalette("neon")).toBe(false);
    expect(isPalette(null)).toBe(false);
    expect(isPalette(3)).toBe(false);
  });
});

describe("PALETTE_META", () => {
  it("describes every palette", () => {
    expect(Object.keys(PALETTE_META).sort()).toEqual([...PALETTES].sort());
  });
});

describe("PALETTE_BOOT_SCRIPT", () => {
  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.palette;
    vi.restoreAllMocks();
  });

  it("applies the stored palette", () => {
    localStorage.setItem(PALETTE_STORAGE_KEY, "paper");
    runBootScript();
    expect(document.documentElement.dataset.palette).toBe("paper");
  });

  it("falls back to the default for an unknown stored value", () => {
    localStorage.setItem(PALETTE_STORAGE_KEY, "neon");
    runBootScript();
    expect(document.documentElement.dataset.palette).toBe(DEFAULT_PALETTE);
  });

  it("falls back to the default when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    runBootScript();
    expect(document.documentElement.dataset.palette).toBe(DEFAULT_PALETTE);
  });
});
