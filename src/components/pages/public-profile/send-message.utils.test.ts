import { describe, expect, it } from "vitest";
import { parseSuggestions } from "./send-message.utils";

describe("parseSuggestions", () => {
  it("splits on || and trims each prompt", () => {
    expect(parseSuggestions(" One? || Two? ||Three? ")).toEqual([
      "One?",
      "Two?",
      "Three?",
    ]);
  });

  it("drops empty segments and handles missing input", () => {
    expect(parseSuggestions("A|| ||B||")).toEqual(["A", "B"]);
    expect(parseSuggestions(undefined)).toEqual([]);
    expect(parseSuggestions("")).toEqual([]);
  });
});
