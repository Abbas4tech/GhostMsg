import { describe, expect, it } from "vitest";
import {
  quarantineConcealNote,
  quarantineRevealReason,
  quarantineTagLabel,
} from "./quarantine-reason";

describe("quarantine reason copy", () => {
  it("names the tag after the reason", () => {
    expect(quarantineTagLabel("hurtful")).toBe("Hurtful language");
    expect(quarantineTagLabel("spam")).toBe("Spam");
    expect(quarantineTagLabel("threat")).toBe("Threat");
  });

  it("keeps the generic tag for older messages without a reason", () => {
    expect(quarantineTagLabel(undefined)).toBe("Quarantined");
  });

  it("explains the blur on the card", () => {
    expect(quarantineConcealNote("spam")).toBe("Hidden. Flagged as spam.");
    expect(quarantineConcealNote("threat")).toBe(
      "Hidden. Flagged as a threat."
    );
    expect(quarantineConcealNote(undefined)).toBe(
      "Hidden. Flagged as hurtful."
    );
  });

  it("explains the reason in the reveal dialog", () => {
    expect(quarantineRevealReason("hurtful")).toBe(
      "It was flagged for hurtful language."
    );
    expect(quarantineRevealReason(undefined)).toBe(
      "It was flagged as hurtful or spam."
    );
  });
});
