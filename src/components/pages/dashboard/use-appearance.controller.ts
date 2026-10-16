"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";
import type { ColorMode } from "@/components/blocks/settings-panel";
import { PALETTE_OPTIONS } from "@/components/elements/palette-picker";
import { isPalette } from "@/lib/theme/palette";
import { usePalette } from "@/providers/palette-provider";

const isColorMode = (value: unknown): value is ColorMode =>
  value === "light" || value === "dark" || value === "system";

/** Settings → Appearance: light/dark/system (next-themes) and palette. */
export function useAppearanceController() {
  const { theme, setTheme } = useTheme();
  const { palette, setPalette } = usePalette();

  const handlePaletteChange = useCallback(
    (next: string) => {
      if (isPalette(next)) {
        setPalette(next);
      }
    },
    [setPalette]
  );

  return {
    handleModeChange: setTheme as (mode: ColorMode) => void,
    handlePaletteChange,
    mode: isColorMode(theme) ? theme : "system",
    palette,
    palettes: PALETTE_OPTIONS,
  };
}
