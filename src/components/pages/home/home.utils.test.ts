import { describe, expect, it } from "vitest";
import {
  buildClaimHref,
  buildLinkPrefix,
  buildLiveProfileHref,
} from "./home.utils";

describe("buildClaimHref", () => {
  it("passes the trimmed username to sign-up", () => {
    expect(buildClaimHref("  maya.writes ")).toBe(
      "/sign-up?username=maya.writes"
    );
  });

  it("encodes unsafe characters", () => {
    expect(buildClaimHref("a b&c")).toBe("/sign-up?username=a%20b%26c");
  });

  it("goes to plain sign-up when empty", () => {
    expect(buildClaimHref("   ")).toBe("/sign-up");
  });
});

describe("buildLinkPrefix", () => {
  it("uses the current host", () => {
    expect(buildLinkPrefix("localhost:3000")).toBe("localhost:3000/u/");
  });

  it("falls back to the brand host", () => {
    expect(buildLinkPrefix(undefined)).toBe("ghostmsg.app/u/");
  });
});

describe("buildLiveProfileHref", () => {
  it("links the configured showcase profile", () => {
    expect(buildLiveProfileHref(" maya ")).toBe("/u/maya");
  });

  it("hides the link when no profile is configured", () => {
    expect(buildLiveProfileHref(undefined)).toBeUndefined();
    expect(buildLiveProfileHref("  ")).toBeUndefined();
  });
});
