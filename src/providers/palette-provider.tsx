"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getStrictContext } from "@/hooks/get-strict-context";
import {
  DEFAULT_PALETTE,
  isPalette,
  PALETTE_STORAGE_KEY,
  type Palette,
} from "@/lib/theme/palette";

export interface PaletteContextValue {
  palette: Palette;
  setPalette: (palette: Palette) => void;
}

const [PaletteContextProvider, usePalette] =
  getStrictContext<PaletteContextValue>("PaletteProvider");

export interface PaletteProviderProps {
  children: ReactNode;
  /** Pins the palette (Storybook toolbar) instead of the stored preference. */
  forcedPalette?: Palette;
}

/**
 * Owns the colour palette (`<html data-palette>`). The boot script in the root
 * layout applies the stored palette before paint; this provider reads it back
 * after hydration and persists changes.
 */
export default function PaletteProvider({
  children,
  forcedPalette,
}: PaletteProviderProps): React.JSX.Element {
  const [palette, setPaletteState] = useState<Palette>(
    forcedPalette ?? DEFAULT_PALETTE
  );

  useEffect(() => {
    const root = document.documentElement;
    if (forcedPalette) {
      root.dataset.palette = forcedPalette;
      setPaletteState(forcedPalette);
      return;
    }
    if (isPalette(root.dataset.palette)) {
      setPaletteState(root.dataset.palette);
    }
  }, [forcedPalette]);

  // Another tab changed the palette: follow it (the event fires only in
  // other tabs of this origin, never in the one that wrote it).
  useEffect(() => {
    if (forcedPalette) {
      return;
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === PALETTE_STORAGE_KEY && isPalette(event.newValue)) {
        document.documentElement.dataset.palette = event.newValue;
        setPaletteState(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [forcedPalette]);

  const setPalette = useCallback((next: Palette) => {
    setPaletteState(next);
    document.documentElement.dataset.palette = next;
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, next);
    } catch {
      // Storage blocked (private mode): the palette still applies for this visit.
    }
  }, []);

  const value = useMemo(() => ({ palette, setPalette }), [palette, setPalette]);

  return (
    <PaletteContextProvider value={value}>{children}</PaletteContextProvider>
  );
}

export { usePalette };
