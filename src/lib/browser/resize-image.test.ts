import { describe, expect, it } from "vitest";
import { fitWithin } from "./resize-image";

describe("fitWithin", () => {
  it("scales the longest side down to the limit", () => {
    expect(fitWithin(1024, 512, 256)).toEqual({ width: 256, height: 128 });
  });

  it("never upscales small images", () => {
    expect(fitWithin(100, 80, 256)).toEqual({ width: 100, height: 80 });
  });
});
