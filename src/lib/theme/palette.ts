/**
 * Colour palettes. A palette is independent of light/dark mode (next-themes
 * owns that): the two combine as `<html data-palette="…" class="dark">`, and
 * src/app/globals.css defines every palette × mode token set.
 */
export const PALETTES = ["spectral", "midnight", "paper"] as const;

export type Palette = (typeof PALETTES)[number];

export const DEFAULT_PALETTE: Palette = "spectral";

export const PALETTE_STORAGE_KEY = "ghostmsg-palette";

export interface PaletteMeta {
  description: string;
  label: string;
  /** Three fixed colours previewing the palette, whatever palette is active. */
  swatch: readonly [string, string, string];
}

export const PALETTE_META: Record<Palette, PaletteMeta> = {
  spectral: {
    label: "Soft spectral",
    description: "Misty lavender, violet and coral",
    swatch: [
      "oklch(0.48 0.21 292)",
      "oklch(0.5 0.22 320)",
      "oklch(0.55 0.17 30)",
    ],
  },
  midnight: {
    label: "Midnight confessional",
    description: "Warm black, amber ember, serif letters",
    swatch: [
      "oklch(0.15 0.012 40)",
      "oklch(0.47 0.11 50)",
      "oklch(0.79 0.12 65)",
    ],
  },
  paper: {
    label: "Playful paper",
    description: "Cream paper, ink outlines, bright stickers",
    swatch: [
      "oklch(0.97 0.03 95)",
      "oklch(0.56 0.19 38)",
      "oklch(0.89 0.09 350)",
    ],
  },
};

export const isPalette = (value: unknown): value is Palette =>
  typeof value === "string" && (PALETTES as readonly string[]).includes(value);

/**
 * Inline script for <head>: applies the stored palette before first paint so
 * there is no flash of the default palette. Kept dependency-free (it runs as a
 * string) and wrapped in try/catch because storage can be blocked.
 */
export const PALETTE_BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var p=localStorage.getItem(${JSON.stringify(PALETTE_STORAGE_KEY)});d.dataset.palette=${JSON.stringify(PALETTES)}.indexOf(p)>-1?p:${JSON.stringify(DEFAULT_PALETTE)}}catch(e){d.dataset.palette=${JSON.stringify(DEFAULT_PALETTE)}}})()`;
