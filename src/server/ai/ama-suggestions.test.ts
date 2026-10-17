import { describe, expect, it } from "vitest";
import {
  FALLBACK_AMA_SUGGESTIONS,
  generateAmaSuggestions,
  parseAmaSuggestions,
} from "./ama-suggestions";

describe("parseAmaSuggestions", () => {
  it("splits, trims quotes and keeps at most three", () => {
    expect(parseAmaSuggestions('"One" || Two ||- Three|| Four')).toEqual([
      "One",
      "Two",
      "Three",
    ]);
  });

  it("drops empty and over-long items", () => {
    expect(parseAmaSuggestions(` || ${"x".repeat(121)} || ok`)).toEqual(["ok"]);
  });
});

describe("generateAmaSuggestions", () => {
  it("falls back without an AI key", async () => {
    const original = process.env.GOOGLE_AI_STUDIO_SECRET;
    delete process.env.GOOGLE_AI_STUDIO_SECRET;
    await expect(generateAmaSuggestions()).resolves.toEqual([
      ...FALLBACK_AMA_SUGGESTIONS,
    ]);
    process.env.GOOGLE_AI_STUDIO_SECRET = original;
  });
});
