/**
 * Draws the Story Card PNG on a canvas with the active palette's tokens, so
 * the export matches the on-screen StoryCardPreview.
 */

export type StoryCardFormat = "story" | "square";
export type StoryCardLook = "gradient" | "plain";

export interface StoryCardColors {
  /** Gradient stops of --brand-gradient (CSS colours). */
  gradient: string[];
  /** Text on the gradient (--brand-foreground). */
  onGradient: string;
  /** Text panels on the gradient (--brand-overlay). */
  overlay: string;
  /** Plain look: --card / --foreground / --muted. */
  plainBackground: string;
  plainForeground: string;
  plainPanel: string;
}

export interface StoryCardFonts {
  display: string;
  sans: string;
}

export interface StoryCardDrawOptions {
  answer?: string;
  colors: StoryCardColors;
  fonts: StoryCardFonts;
  format: StoryCardFormat;
  label?: string;
  look: StoryCardLook;
  /** Footer link (null hides it). */
  profileLabel: string | null;
  question: string;
  username: string;
}

export const STORY_CARD_SIZE: Record<
  StoryCardFormat,
  { height: number; width: number }
> = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};

const WHITESPACE = /\s+/;

const OKLCH_OR_COLOR = /(oklch|rgba?|hsla?)\([^)]*\)|#[0-9a-f]{3,8}/gi;

const FALLBACK_COLORS: StoryCardColors = {
  gradient: ["#5b21b6", "#a21caf", "#ea580c"],
  onGradient: "#ffffff",
  overlay: "rgba(20, 10, 40, 0.3)",
  plainBackground: "#ffffff",
  plainForeground: "#1c1530",
  plainPanel: "#f3f0fa",
};

/** Reads the palette tokens from :root (falls back to Soft spectral hexes). */
export function readStoryCardTheme(root: HTMLElement): {
  colors: StoryCardColors;
  fonts: StoryCardFonts;
} {
  const style = getComputedStyle(root);
  const token = (name: string): string => style.getPropertyValue(name).trim();
  const gradient = token("--brand-gradient").match(OKLCH_OR_COLOR) ?? [];

  return {
    colors: {
      gradient: gradient.length > 1 ? gradient : FALLBACK_COLORS.gradient,
      onGradient: token("--brand-foreground") || FALLBACK_COLORS.onGradient,
      overlay: token("--brand-overlay") || FALLBACK_COLORS.overlay,
      plainBackground: token("--card") || FALLBACK_COLORS.plainBackground,
      plainForeground: token("--foreground") || FALLBACK_COLORS.plainForeground,
      plainPanel: token("--muted") || FALLBACK_COLORS.plainPanel,
    },
    fonts: {
      display: token("--app-font-display") || "sans-serif",
      sans: token("--app-font-sans") || "sans-serif",
    },
  };
}

/** Splits text into lines that fit `maxWidth` with the current ctx font. */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(WHITESPACE)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}

function fillLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number
): number {
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
  return y + lines.length * lineHeight;
}

function paintBackground(
  ctx: CanvasRenderingContext2D,
  { colors, look }: StoryCardDrawOptions,
  width: number,
  height: number
): void {
  if (look === "plain") {
    ctx.fillStyle = colors.plainBackground;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const lastStop = colors.gradient.length - 1;
  colors.gradient.forEach((color, index) => {
    gradient.addColorStop(index / lastStop, color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Soft decorative circles, as on the preview.
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = colors.onGradient;
  ctx.beginPath();
  ctx.arc(width - 60, 60, width * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Renders the whole card; the canvas is resized to the chosen format. */
export function drawStoryCard(
  canvas: HTMLCanvasElement,
  options: StoryCardDrawOptions
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const { width, height } = STORY_CARD_SIZE[options.format];
  canvas.width = width;
  canvas.height = height;

  const isStory = options.format === "story";
  const pad = 84;
  const inner = width - pad * 2;
  const ink =
    options.look === "plain"
      ? options.colors.plainForeground
      : options.colors.onGradient;
  const panel =
    options.look === "plain"
      ? options.colors.plainPanel
      : options.colors.overlay;

  paintBackground(ctx, options, width, height);
  ctx.fillStyle = ink;
  ctx.textBaseline = "alphabetic";

  // Header: brand + sentiment chip.
  ctx.font = `700 40px ${options.fonts.sans}`;
  ctx.fillText("GhostMsg", pad, pad + 40);
  if (options.label) {
    ctx.font = `700 34px ${options.fonts.sans}`;
    const chipWidth = ctx.measureText(options.label).width + 56;
    ctx.fillStyle = panel;
    ctx.beginPath();
    ctx.roundRect(width - pad - chipWidth, pad - 10, chipWidth, 72, 36);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.fillText(options.label, width - pad - chipWidth + 28, pad + 38);
  }

  // Middle: eyebrow, question, answer panel.
  const questionSize = isStory ? 92 : 68;
  ctx.font = `800 ${questionSize}px ${options.fonts.display}`;
  const questionLines = wrapLines(ctx, `“${options.question}”`, inner);
  ctx.font = `600 ${isStory ? 46 : 38}px ${options.fonts.sans}`;
  const answerLines = options.answer
    ? wrapLines(ctx, options.answer, inner - 88)
    : [];
  const answerHeight = answerLines.length
    ? 140 + answerLines.length * (isStory ? 62 : 52)
    : 0;
  const blockHeight =
    60 + questionLines.length * questionSize * 1.06 + answerHeight;
  let y = Math.max(pad + 160, (height - blockHeight) / 2);

  ctx.font = `700 34px ${options.fonts.sans}`;
  ctx.fillText("AN ANONYMOUS MESSAGE", pad, y);
  y += 40 + questionSize;
  ctx.font = `800 ${questionSize}px ${options.fonts.display}`;
  y = fillLines(ctx, questionLines, pad, y, questionSize * 1.06);

  if (answerLines.length) {
    y += 20;
    ctx.fillStyle = panel;
    ctx.beginPath();
    ctx.roundRect(pad, y, inner, answerHeight - 40, 52);
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.font = `700 30px ${options.fonts.sans}`;
    ctx.fillText(
      `${options.username.toUpperCase()} ANSWERED`,
      pad + 44,
      y + 64
    );
    ctx.font = `600 ${isStory ? 46 : 38}px ${options.fonts.sans}`;
    fillLines(ctx, answerLines, pad + 44, y + 130, isStory ? 62 : 52);
  }

  // Footer: invitation + link.
  if (options.profileLabel) {
    ctx.font = `600 34px ${options.fonts.sans}`;
    ctx.fillText(
      "Send me one. Nobody will know it's you.",
      pad,
      height - pad - 64
    );
    ctx.font = `800 46px ${options.fonts.display}`;
    ctx.fillText(options.profileLabel, pad, height - pad);
  }
}
