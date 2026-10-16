import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { moderateAndClassifyMessage } from "./moderation";

const { generateObject } = vi.hoisted(() => ({ generateObject: vi.fn() }));

vi.mock("ai", () => ({ generateObject }));
vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: () => ({ chat: () => ({}) }),
}));

const replyWith = (object: Record<string, unknown>) =>
  generateObject.mockResolvedValueOnce({ object });

describe("moderateAndClassifyMessage", () => {
  const originalKey = process.env.GOOGLE_AI_STUDIO_SECRET;

  beforeEach(() => {
    process.env.GOOGLE_AI_STUDIO_SECRET = "test-key";
    generateObject.mockReset();
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env.GOOGLE_AI_STUDIO_SECRET = originalKey;
    vi.restoreAllMocks();
  });

  it("delivers as clean and neutral without an AI key (fail open)", async () => {
    delete process.env.GOOGLE_AI_STUDIO_SECRET;

    const result = await moderateAndClassifyMessage("You are super awesome!");

    expect(result).toEqual({
      isToxic: false,
      toxicity: "none",
      sentimentTag: "neutral",
    });
    expect(generateObject).not.toHaveBeenCalled();
  });

  it.each([
    ["none", false],
    ["borderline", false],
    ["hurtful", true],
    ["severe", true],
  ] as const)("reads toxicity %s (isToxic = %s)", async (toxicity, isToxic) => {
    replyWith({ toxicity, sentimentTag: "curious" });

    await expect(moderateAndClassifyMessage("A message")).resolves.toEqual({
      toxicity,
      isToxic,
      sentimentTag: "curious",
    });
  });

  it("fails open when the structured call throws (schema mismatch, quota, network)", async () => {
    generateObject.mockRejectedValueOnce(new Error("quota exceeded"));

    await expect(
      moderateAndClassifyMessage("A message")
    ).resolves.toMatchObject({
      toxicity: "none",
      isToxic: false,
      sentimentTag: "neutral",
    });
  });
});
