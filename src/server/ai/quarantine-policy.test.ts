import { describe, expect, it } from "vitest";
import {
  isToxicityLevel,
  shouldQuarantine,
  toQuarantineReason,
} from "./quarantine-policy";

describe("shouldQuarantine", () => {
  it("defaults to balanced: hurtful and severe are held", () => {
    expect(shouldQuarantine("none", undefined)).toBe(false);
    expect(shouldQuarantine("borderline", undefined)).toBe(false);
    expect(shouldQuarantine("hurtful", undefined)).toBe(true);
    expect(shouldQuarantine("severe", undefined)).toBe(true);
  });

  it("relaxed holds only severe abuse", () => {
    const safety = { sensitivity: "relaxed" as const };
    expect(shouldQuarantine("hurtful", safety)).toBe(false);
    expect(shouldQuarantine("severe", safety)).toBe(true);
  });

  it("strict also holds borderline messages", () => {
    expect(shouldQuarantine("borderline", { sensitivity: "strict" })).toBe(
      true
    );
  });

  it("never quarantines when switched off", () => {
    expect(shouldQuarantine("severe", { quarantineEnabled: false })).toBe(
      false
    );
  });
});

describe("isToxicityLevel", () => {
  it("narrows known levels", () => {
    expect(isToxicityLevel("hurtful")).toBe(true);
    expect(isToxicityLevel("nasty")).toBe(false);
  });
});

describe("toQuarantineReason", () => {
  it("keeps moderation's category", () => {
    expect(toQuarantineReason("spam")).toBe("spam");
    expect(toQuarantineReason("threat")).toBe("threat");
    expect(toQuarantineReason("hurtful")).toBe("hurtful");
  });

  it("reads an uncategorised hold as hurtful", () => {
    expect(toQuarantineReason("none")).toBe("hurtful");
  });
});
