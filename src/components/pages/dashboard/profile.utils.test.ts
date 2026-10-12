import { describe, expect, it } from "vitest";
import { buildProfileUrl } from "./profile.utils";

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
