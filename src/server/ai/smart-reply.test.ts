import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FALLBACK_DRAFTS, generateSmartReplies } from "./smart-reply";

const { generateObject } = vi.hoisted(() => ({ generateObject: vi.fn() }));

vi.mock("ai", () => ({ generateObject }));
vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: () => ({ chat: () => ({}) }),
}));

const FALLBACK = [
  { text: FALLBACK_DRAFTS.thoughtful, tone: "thoughtful" },
  { text: FALLBACK_DRAFTS.witty, tone: "witty" },
  { text: FALLBACK_DRAFTS.wholesome, tone: "wholesome" },
];

describe("generateSmartReplies", () => {
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

  it("returns the three fallback drafts without an AI key", async () => {
    delete process.env.GOOGLE_AI_STUDIO_SECRET;

    await expect(generateSmartReplies("What drives you?")).resolves.toEqual(
      FALLBACK
    );
    expect(generateObject).not.toHaveBeenCalled();
  });

  it("asks for all three tones in one call and lists them in order", async () => {
    generateObject.mockResolvedValueOnce({
      object: {
        thoughtful: "Honestly, sometimes. But it taught me what I want.",
        wholesome: "Thank you for asking. It means a lot.",
        witty: '"Ask me again in a year."',
      },
    });

    const drafts = await generateSmartReplies(
      "Do you ever regret saying yes to that job?"
    );

    expect(generateObject).toHaveBeenCalledOnce();
    expect(drafts).toEqual([
      {
        text: "Honestly, sometimes. But it taught me what I want.",
        tone: "thoughtful",
      },
      { text: "Ask me again in a year.", tone: "witty" },
      { text: "Thank you for asking. It means a lot.", tone: "wholesome" },
    ]);
  });

  it("caps each draft at 180 characters", async () => {
    generateObject.mockResolvedValueOnce({
      object: { thoughtful: "a".repeat(400), wholesome: "b", witty: "c" },
    });

    const [thoughtful] = await generateSmartReplies("Hi");

    expect(thoughtful?.text).toHaveLength(180);
  });

  it("falls back when the AI call fails", async () => {
    generateObject.mockRejectedValueOnce(new Error("quota exceeded"));

    await expect(generateSmartReplies("Hi")).resolves.toEqual(FALLBACK);
  });
});
