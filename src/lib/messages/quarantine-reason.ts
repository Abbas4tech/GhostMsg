import type { MessageDto } from "@/types/api";

export type QuarantineReason = NonNullable<MessageDto["quarantineReason"]>;

/** The Quarantined tag (design: "Hurtful language", "Spam"). */
export const QUARANTINE_REASON_LABEL: Record<QuarantineReason, string> = {
  hurtful: "Hurtful language",
  spam: "Spam",
  threat: "Threat",
};

/** Blur chip on the card (design: "Hidden. Flagged as hurtful."). */
const CONCEAL_NOTE: Record<QuarantineReason, string> = {
  hurtful: "Hidden. Flagged as hurtful.",
  spam: "Hidden. Flagged as spam.",
  threat: "Hidden. Flagged as a threat.",
};

/** Reveal dialog (design: "It was flagged for hurtful language."). */
const REVEAL_REASON: Record<QuarantineReason, string> = {
  hurtful: "It was flagged for hurtful language.",
  spam: "It was flagged as spam.",
  threat: "It was flagged as a threat.",
};

/** Older messages have no stored reason: they keep the generic wording. */
export const quarantineTagLabel = (reason?: QuarantineReason): string =>
  reason ? QUARANTINE_REASON_LABEL[reason] : "Quarantined";

export const quarantineConcealNote = (reason?: QuarantineReason): string =>
  reason ? CONCEAL_NOTE[reason] : CONCEAL_NOTE.hurtful;

export const quarantineRevealReason = (reason?: QuarantineReason): string =>
  reason ? REVEAL_REASON[reason] : "It was flagged as hurtful or spam.";
