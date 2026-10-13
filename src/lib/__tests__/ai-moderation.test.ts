import { describe, expect, it } from "vitest";
import { moderateAndClassifyMessage } from "../ai-moderation";

describe("ai-moderation.ts", () => {
  it("should return fallback neutral classification if GOOGLE_AI_STUDIO_SECRET is missing", async () => {
    const originalEnv = process.env.GOOGLE_AI_STUDIO_SECRET;
    delete process.env.GOOGLE_AI_STUDIO_SECRET;

    const result = await moderateAndClassifyMessage("You are super awesome!");

    expect(result).toEqual({
      isToxic: false,
      sentimentTag: "neutral",
    });

    process.env.GOOGLE_AI_STUDIO_SECRET = originalEnv;
  });

  it("should handle invalid JSON responses from AI model gracefully", async () => {
    process.env.GOOGLE_AI_STUDIO_SECRET = "mock-api-key";

    // Calling with non-JSON model return mock
    const result = await moderateAndClassifyMessage("Random text message");
    expect(result).toHaveProperty("isToxic");
    expect(result).toHaveProperty("sentimentTag");
  });
});
