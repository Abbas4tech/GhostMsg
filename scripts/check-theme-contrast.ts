/**
 * Checks WCAG 2.x contrast for every palette × mode defined in
 * src/app/globals.css, so a token tweak can never silently break AA.
 *
 *   pnpm theme:contrast   → prints the weakest pair per theme, exit 1 on a failure
 *
 * Text pairs need 4.5:1, UI pairs (focus ring, input border, icons) need 3:1.
 */
import fs from "node:fs";
import path from "node:path";

const CSS_PATH = path.join(process.cwd(), "src/app/globals.css");

const TEXT_MIN = 4.5;
const UI_MIN = 3;

const PALETTES = ["spectral", "midnight", "paper"] as const;
const MODES = ["light", "dark"] as const;
const SENTIMENTS = ["sweet", "curious", "spicy", "advice", "neutral"] as const;

type Tokens = Record<string, string>;

interface Pair {
  bg: string;
  fg: string;
  min: number;
}

const OKLCH_PATTERN = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/g;
const DECLARATION_PATTERN = /--([\w-]+)\s*:\s*([^;]+);/g;

const readBlock = (css: string, selector: string): Tokens => {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) {
    throw new Error(`Selector not found in globals.css: ${selector}`);
  }
  const end = css.indexOf("\n}", start);
  const tokens: Tokens = {};
  for (const [, name, value] of css
    .slice(start, end)
    .matchAll(DECLARATION_PATTERN)) {
    tokens[name] = value.trim();
  }
  return tokens;
};

const resolveTheme = (
  css: string,
  palette: (typeof PALETTES)[number],
  mode: (typeof MODES)[number]
): Tokens => {
  const layers = [readBlock(css, ":root")];
  if (mode === "dark") {
    layers.push(readBlock(css, ".dark"));
  }
  if (palette !== "spectral") {
    layers.push(readBlock(css, `:root[data-palette="${palette}"]`));
    if (mode === "dark") {
      layers.push(readBlock(css, `:root.dark[data-palette="${palette}"]`));
    }
  }
  return Object.assign({}, ...layers);
};

/** OKLCH → linear sRGB (clamped) → WCAG relative luminance. */
const luminance = (l: number, c: number, h: number): number => {
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);
  const l_ = (l + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3;
  const m_ = (l - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3;
  const s_ = (l - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3;
  const clamp = (v: number): number => Math.min(1, Math.max(0, v));
  const red = clamp(
    4.076_741_662_1 * l_ - 3.307_711_591_3 * m_ + 0.230_969_929_2 * s_
  );
  const green = clamp(
    -1.268_438_004_6 * l_ + 2.609_757_401_1 * m_ - 0.341_319_396_5 * s_
  );
  const blue = clamp(
    -0.004_196_086_3 * l_ - 0.703_418_614_7 * m_ + 1.707_614_701 * s_
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const colorsOf = (value: string): number[] =>
  [...value.matchAll(OKLCH_PATTERN)].map(([, l, c, h]) =>
    luminance(Number(l), Number(c), Number(h))
  );

const ratio = (a: number, b: number): number =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const text = (fg: string, bg: string): Pair => ({ bg, fg, min: TEXT_MIN });
const ui = (fg: string, bg: string): Pair => ({ bg, fg, min: UI_MIN });

const PAIRS: Pair[] = [
  text("foreground", "background"),
  text("card-foreground", "card"),
  text("popover-foreground", "popover"),
  text("muted-foreground", "background"),
  text("muted-foreground", "muted"),
  text("muted-foreground", "card"),
  text("primary-foreground", "primary"),
  text("primary", "background"),
  text("primary", "card"),
  text("secondary-foreground", "secondary"),
  text("accent-foreground", "accent"),
  text("destructive-foreground", "destructive"),
  text("destructive", "background"),
  text("destructive", "card"),
  text("success-foreground", "success"),
  text("warning-foreground", "warning"),
  text("info-foreground", "info"),
  text("sidebar-foreground", "sidebar"),
  text("sidebar-primary-foreground", "sidebar-primary"),
  text("sidebar-accent-foreground", "sidebar-accent"),
  text("brand-foreground", "brand-gradient"),
  ...SENTIMENTS.flatMap((s) => [
    text(`sentiment-${s}`, `sentiment-${s}-subtle`),
    text(`sentiment-${s}-foreground`, `sentiment-${s}`),
  ]),
  ui("ring", "background"),
  ui("input", "background"),
  ui("star", "card"),
  ui("success", "card"),
  ui("info", "card"),
  ui("chart-1", "card"),
  ui("chart-2", "card"),
  ui("chart-3", "card"),
  ui("chart-4", "card"),
  ui("chart-5", "card"),
];

interface PairResult {
  label: string;
  /** Contrast ratio; NaN when a token is missing. */
  value: number;
}

const evaluatePair = (tokens: Tokens, { fg, bg }: Pair): PairResult => {
  const [fgLum] = colorsOf(tokens[fg] ?? "");
  const bgStops = colorsOf(tokens[bg] ?? "");
  const label = `${fg} on ${bg}`;
  if (fgLum === undefined || bgStops.length === 0) {
    return { label, value: Number.NaN };
  }
  // Gradients: every stop must pass, so judge the worst one.
  return {
    label,
    value: Math.min(...bgStops.map((stop) => ratio(fgLum, stop))),
  };
};

/** Logs failures for one palette × mode and returns how many there were. */
const checkTheme = (theme: string, tokens: Tokens): number => {
  let failures = 0;
  let weakest = { label: "", score: Number.POSITIVE_INFINITY };

  for (const pair of PAIRS) {
    const { label, value } = evaluatePair(tokens, pair);
    if (Number.isNaN(value)) {
      console.error(`  ✗ ${theme}: missing token in ${label}`);
      failures += 1;
      continue;
    }
    if (value < pair.min) {
      console.error(
        `  ✗ ${theme}: ${label} = ${value.toFixed(2)} (needs ${pair.min})`
      );
      failures += 1;
    }
    if (value / pair.min < weakest.score) {
      weakest = {
        label: `${label} ${value.toFixed(2)}`,
        score: value / pair.min,
      };
    }
  }
  console.log(`${theme}: weakest ${weakest.label}`);
  return failures;
};

const main = (): void => {
  const css = fs.readFileSync(CSS_PATH, "utf8");
  let failures = 0;

  for (const palette of PALETTES) {
    for (const mode of MODES) {
      failures += checkTheme(
        `${palette}/${mode}`,
        resolveTheme(css, palette, mode)
      );
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} contrast failure(s).`);
    process.exit(1);
  }
  console.log("\nAll palette × mode pairs pass WCAG AA.");
};

main();
