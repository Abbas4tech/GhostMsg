import { describe, expect, it } from "vitest";
import { generateSmartReply } from "../ai-smart-reply";

describe("ai-smart-reply.ts", () => {
  it("should return fallback witty reply when API key is missing", async () => {
    const originalSecret = process.env.GOOGLE_AI_STUDIO_SECRET;
    delete process.env.GOOGLE_AI_STUDIO_SECRET;

    const reply = await generateSmartReply("What is your secret?", "witty");
    expect(reply).toBe("Haha, thanks for keeping me on my toes! 😉");

    process.env.GOOGLE_AI_STUDIO_SECRET = originalSecret;
  });

  it("should return fallback wholesome reply when API key is missing", async () => {
    const originalSecret = process.env.GOOGLE_AI_STUDIO_SECRET;
    delete process.env.GOOGLE_AI_STUDIO_SECRET;

    const reply = await generateSmartReply("You are awesome!", "wholesome");
    expect(reply).toBe("Thank you so much! That means a lot to me. ✨");

    process.env.GOOGLE_AI_STUDIO_SECRET = originalSecret;
  });

  it("should return fallback thoughtful reply when API key is missing", async () => {
    const originalSecret = process.env.GOOGLE_AI_STUDIO_SECRET;
    delete process.env.GOOGLE_AI_STUDIO_SECRET;

    const reply = await generateSmartReply("What drives you?", "thoughtful");
    expect(reply).toBe(
      "That's a really interesting point. It definitely got me thinking!"
    );

    process.env.GOOGLE_AI_STUDIO_SECRET = originalSecret;
  });
});
