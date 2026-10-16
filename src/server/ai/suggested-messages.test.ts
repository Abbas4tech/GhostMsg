import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSuggestedMessagesSource,
  FALLBACK_SUGGESTIONS,
} from "./suggested-messages";

const { generateText } = vi.hoisted(() => ({ generateText: vi.fn() }));

vi.mock("ai", () => ({ generateText }));
vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: () => ({ chat: () => ({}) }),
}));

describe("getSuggestedMessages", () => {
  const originalKey = process.env.GOOGLE_AI_STUDIO_SECRET;

  beforeEach(() => {
    process.env.GOOGLE_AI_STUDIO_SECRET = "test-key";
    generateText.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env.GOOGLE_AI_STUDIO_SECRET = originalKey;
    vi.restoreAllMocks();
  });

  it("picks a random fallback without an AI key, with no AI call", async () => {
    delete process.env.GOOGLE_AI_STUDIO_SECRET;
    const getSuggestedMessages = createSuggestedMessagesSource();

    const result = await getSuggestedMessages();

    expect(FALLBACK_SUGGESTIONS).toContain(result);
    expect(generateText).not.toHaveBeenCalled();
  });

  it("calls the model once, then serves every request from cache until it expires", async () => {
    generateText.mockResolvedValue({ text: "q1||q2||q3" });
    const getSuggestedMessages = createSuggestedMessagesSource();
    const start = 1_000_000;

    const first = await getSuggestedMessages(start);
    const stillCached = await getSuggestedMessages(start + 10 * 60 * 1000); // +10 min

    expect(first).toBe("q1||q2||q3");
    expect(stillCached).toBe("q1||q2||q3");
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("calls the model again once the cache has expired", async () => {
    generateText
      .mockResolvedValueOnce({ text: "batch-one" })
      .mockResolvedValueOnce({ text: "batch-two" });
    const getSuggestedMessages = createSuggestedMessagesSource();
    const start = 1_000_000;

    const first = await getSuggestedMessages(start);
    const afterExpiry = await getSuggestedMessages(start + 16 * 60 * 1000); // +16 min

    expect(first).toBe("batch-one");
    expect(afterExpiry).toBe("batch-two");
    expect(generateText).toHaveBeenCalledTimes(2);
  });

  it("falls back on error without caching the fallback", async () => {
    generateText
      .mockRejectedValueOnce(new Error("quota exceeded"))
      .mockResolvedValueOnce({ text: "q1||q2||q3" });
    const getSuggestedMessages = createSuggestedMessagesSource();
    const start = 1_000_000;

    const failed = await getSuggestedMessages(start);
    const next = await getSuggestedMessages(start + 1000);

    expect(FALLBACK_SUGGESTIONS).toContain(failed);
    expect(next).toBe("q1||q2||q3");
    expect(generateText).toHaveBeenCalledTimes(2);
  });

  it("keeps independent caches across separate sources", async () => {
    generateText.mockResolvedValue({ text: "only-for-this-source" });
    const sourceA = createSuggestedMessagesSource();
    const sourceB = createSuggestedMessagesSource();

    await sourceA(1_000_000);

    delete process.env.GOOGLE_AI_STUDIO_SECRET;
    const resultB = await sourceB(1_000_000);

    expect(FALLBACK_SUGGESTIONS).toContain(resultB);
  });
});
