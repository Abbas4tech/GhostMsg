import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithProviders } from "@/test/test-utils";
import { useAppearanceController } from "./use-appearance.controller";

const { setTheme, setPalette, theme } = vi.hoisted(() => ({
  setTheme: vi.fn(),
  setPalette: vi.fn(),
  theme: { current: "dark" as string | undefined },
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: theme.current, setTheme }),
}));
vi.mock("@/providers/palette-provider", () => ({
  usePalette: () => ({ palette: "spectral", setPalette }),
}));

describe("useAppearanceController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    theme.current = "dark";
  });

  it("exposes the current mode, palette and the palette choices", () => {
    const { result } = renderHookWithProviders(() => useAppearanceController());

    expect(result.current.mode).toBe("dark");
    expect(result.current.palette).toBe("spectral");
    expect(result.current.palettes.map((option) => option.value)).toEqual([
      "spectral",
      "midnight",
      "paper",
    ]);
  });

  it("falls back to system for an unknown theme", () => {
    theme.current = undefined;
    const { result } = renderHookWithProviders(() => useAppearanceController());

    expect(result.current.mode).toBe("system");
  });

  it("sets only known palettes", () => {
    const { result } = renderHookWithProviders(() => useAppearanceController());

    act(() => result.current.handlePaletteChange("neon"));
    expect(setPalette).not.toHaveBeenCalled();

    act(() => result.current.handlePaletteChange("paper"));
    expect(setPalette).toHaveBeenCalledWith("paper");
  });

  it("forwards mode changes to next-themes", () => {
    const { result } = renderHookWithProviders(() => useAppearanceController());

    act(() => result.current.handleModeChange("light"));
    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
