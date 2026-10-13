import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { moderateAndClassifyMessage } from "./moderation";

const { generateText } = vi.hoisted(() => ({ generateText: vi.fn() }));

vi.mock("ai", () => ({ generateText }));
vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: () => ({ chat: () => ({}) }),
}));

const replyWith = (text: string) =>
  generateText.mockResolvedValueOnce({ text });

describe("moderateAndClassifyMessage", () => {
  const originalKey = process.env.GOOGLE_AI_STUDIO_SECRET;

  beforeEach(() => {
    process.env.GOOGLE_AI_STUDIO_SECRET = "test-key";
    generateText.mockReset();
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
    expect(generateText).not.toHaveBeenCalled();
  });

  it.each([
    ["none", false],
    ["borderline", false],
    ["hurtful", true],
    ["severe", true],
  ] as const)("reads toxicity %s (isToxic = %s)", async (toxicity, isToxic) => {
    replyWith(JSON.stringify({ toxicity, sentimentTag: "curious" }));

    await expect(moderateAndClassifyMessage("A message")).resolves.toEqual({
      toxicity,
      isToxic,
      sentimentTag: "curious",
    });
  });

  it("strips markdown code fences around the JSON", async () => {
    replyWith('```json\n{"toxicity":"borderline","sentimentTag":"spicy"}\n```');

    await expect(
      moderateAndClassifyMessage("A message")
    ).resolves.toMatchObject({
      toxicity: "borderline",
      sentimentTag: "spicy",
    });
  });

  it("maps the legacy { isToxic: true } shape to severe", async () => {
    replyWith(JSON.stringify({ isToxic: true, sentimentTag: "neutral" }));

    await expect(
      moderateAndClassifyMessage("A message")
    ).resolves.toMatchObject({
      toxicity: "severe",
      isToxic: true,
    });
  });

  it("falls back to neutral for an unknown sentiment and none for an unknown level", async () => {
    replyWith(JSON.stringify({ toxicity: "extreme", sentimentTag: "angry" }));

    await expect(moderateAndClassifyMessage("A message")).resolves.toEqual({
      toxicity: "none",
      isToxic: false,
      sentimentTag: "neutral",
    });
  });

  it("fails open on invalid JSON", async () => {
    replyWith("I think this message is fine.");

    await expect(moderateAndClassifyMessage("A message")).resolves.toEqual({
      toxicity: "none",
      isToxic: false,
      sentimentTag: "neutral",
    });
  });

  it("fails open when the AI call throws", async () => {
    generateText.mockRejectedValueOnce(new Error("quota exceeded"));

    await expect(
      moderateAndClassifyMessage("A message")
    ).resolves.toMatchObject({
      toxicity: "none",
    });
  });
});
