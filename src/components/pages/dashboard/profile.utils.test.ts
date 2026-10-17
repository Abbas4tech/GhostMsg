import { describe, expect, it } from "vitest";
import {
  buildProfilePatch,
  buildProfileUrl,
  type ProfileFormValues,
} from "./profile.utils";

describe("buildProfileUrl", () => {
  it("joins origin and username", () => {
    expect(buildProfileUrl("https://ghostmsg.app", "johndoe")).toBe(
      "https://ghostmsg.app/u/johndoe"
    );
  });

  it("keeps a relative path before hydration and tolerates a missing username", () => {
    expect(buildProfileUrl("", "johndoe")).toBe("/u/johndoe");
    expect(buildProfileUrl("https://ghostmsg.app", undefined)).toBe(
      "https://ghostmsg.app/u/"
    );
  });
});

describe("buildProfilePatch", () => {
  const values: ProfileFormValues = {
    amaPrompt: "  Ask me about design  ",
    avatarUrl: null,
    displayName: "  Maya R.  ",
    showAmaBanner: false,
  };

  it("sends only the changed fields, trimmed", () => {
    expect(
      buildProfilePatch(values, { amaPrompt: true, displayName: true })
    ).toEqual({ amaPrompt: "Ask me about design", displayName: "Maya R." });
  });

  it("sends null to remove the photo and the banner switch as-is", () => {
    expect(
      buildProfilePatch(values, { avatarUrl: true, showAmaBanner: true })
    ).toEqual({ avatarUrl: null, showAmaBanner: false });
  });

  it("never sends a blank AMA Prompt", () => {
    expect(
      buildProfilePatch({ ...values, amaPrompt: "   " }, { amaPrompt: true })
    ).toEqual({});
  });
});
