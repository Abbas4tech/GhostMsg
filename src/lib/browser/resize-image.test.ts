import { describe, expect, it } from "vitest";
import { fitWithin } from "./resize-image";

describe("fitWithin", () => {
  it("scales the longest side down to the limit", () => {
    expect(fitWithin(1024, 512, 256)).toEqual({ height: 128, width: 256 });
  });

  it("never upscales small images", () => {
    expect(fitWithin(100, 80, 256)).toEqual({ height: 80, width: 100 });
  });
});
