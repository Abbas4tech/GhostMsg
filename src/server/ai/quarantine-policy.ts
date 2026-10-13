import "server-only";
import type { SafetySettings } from "@/server/models/user.model";

/** Graded toxicity from moderation (ADR 0022). */
export type ToxicityLevel = "none" | "borderline" | "hurtful" | "severe";

const TOXICITY_RANK: Record<ToxicityLevel, number> = {
  none: 0,
  borderline: 1,
  hurtful: 2,
  severe: 3,
};

/** Lowest level each sensitivity holds back. */
const THRESHOLD: Record<SafetySettings["sensitivity"], ToxicityLevel> = {
  relaxed: "severe",
  balanced: "hurtful",
  strict: "borderline",
};

const DEFAULT_SAFETY: SafetySettings = {
  quarantineEnabled: true,
  sensitivity: "balanced",
  blurSpicy: false,
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
