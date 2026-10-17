import { describe, expect, it } from "vitest";
import {
  DEFAULT_AMA_PROMPT,
  toBlockedSenders,
  toUserPreferences,
  toUserProfile,
} from "./user-dto";

describe("toUserProfile", () => {
  it("fills defaults for documents created before the profile fields", () => {
    expect(toUserProfile({ email: "m@x.io", username: "maya" })).toEqual({
      amaPrompt: DEFAULT_AMA_PROMPT,
      avatarUrl: null,
      displayName: "",
      email: "m@x.io",
      showAmaBanner: true,
      username: "maya",
    });
  });
});

describe("toUserPreferences", () => {
  it("defaults to suggestions on, publish off, balanced quarantine", () => {
    expect(toUserPreferences({})).toEqual({
      messages: { offerSuggestions: true, publishByDefault: false },
      safety: {
        blurSpicy: false,
        quarantineEnabled: true,
        sensitivity: "balanced",
      },
    });
  });
});

describe("toBlockedSenders", () => {
  it("attaches dates when known and keeps legacy hashes", () => {
    const date = new Date("2026-10-03T10:00:00Z");
    expect(
      toBlockedSenders(["a", "b"], [{ blockedAt: date, hash: "a" }])
    ).toEqual([{ blockedAt: date.toISOString(), hash: "a" }, { hash: "b" }]);
  });
});
