import "server-only";
import type { SafetySettings } from "@/server/models/user.model";

/** Graded toxicity from moderation (ADR 0022). Single source for the level set. */
export const TOXICITY_LEVELS = [
  "none",
  "borderline",
  "hurtful",
  "severe",
] as const;

export type ToxicityLevel = (typeof TOXICITY_LEVELS)[number];

const TOXICITY_RANK: Record<ToxicityLevel, number> = {
  borderline: 1,
  hurtful: 2,
  none: 0,
  severe: 3,
};

/** Lowest level each sensitivity holds back. */
const THRESHOLD: Record<SafetySettings["sensitivity"], ToxicityLevel> = {
  balanced: "hurtful",
  relaxed: "severe",
  strict: "borderline",
};

const DEFAULT_SAFETY: SafetySettings = {
  blurSpicy: false,
  quarantineEnabled: true,
  sensitivity: "balanced",
};

/**
 * Whether a message goes to Quarantined. Relaxed holds only severe abuse,
 * Balanced also clearly hurtful or spammy messages, Strict also borderline
 * ones. Turning quarantine off delivers everything to the main inbox.
 */
export function shouldQuarantine(
  toxicity: ToxicityLevel,
  safety: Partial<SafetySettings> | undefined
): boolean {
  const { quarantineEnabled, sensitivity } = { ...DEFAULT_SAFETY, ...safety };
  if (!quarantineEnabled) {
    return false;
  }
  return TOXICITY_RANK[toxicity] >= TOXICITY_RANK[THRESHOLD[sensitivity]];
}

export const isToxicityLevel = (value: unknown): value is ToxicityLevel =>
  typeof value === "string" && value in TOXICITY_RANK;
