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
    displayName: "  Maya R.  ",
    avatarUrl: null,
    amaPrompt: "  Ask me about design  ",
    showAmaBanner: false,
  };

  it("sends only the changed fields, trimmed", () => {
    expect(
      buildProfilePatch(values, { displayName: true, amaPrompt: true })
    ).toEqual({ displayName: "Maya R.", amaPrompt: "Ask me about design" });
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
