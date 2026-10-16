import { describe, expect, it } from "vitest";
import {
  DEFAULT_AMA_PROMPT,
  toBlockedSenders,
  toUserPreferences,
  toUserProfile,
} from "./user-dto";

describe("toUserProfile", () => {
  it("fills defaults for documents created before the profile fields", () => {
    expect(toUserProfile({ username: "maya", email: "m@x.io" })).toEqual({
      username: "maya",
      email: "m@x.io",
      displayName: "",
      avatarUrl: null,
      amaPrompt: DEFAULT_AMA_PROMPT,
      showAmaBanner: true,
    });
  });
});

describe("toUserPreferences", () => {
  it("defaults to suggestions on, publish off, balanced quarantine", () => {
    expect(toUserPreferences({})).toEqual({
      messages: { offerSuggestions: true, publishByDefault: false },
      safety: {
        quarantineEnabled: true,
        sensitivity: "balanced",
        blurSpicy: false,
      },
    });
  });
});

describe("toBlockedSenders", () => {
  it("attaches dates when known and keeps legacy hashes", () => {
    const date = new Date("2026-10-03T10:00:00Z");
    expect(
      toBlockedSenders(["a", "b"], [{ hash: "a", blockedAt: date }])
    ).toEqual([{ hash: "a", blockedAt: date.toISOString() }, { hash: "b" }]);
  });
});
