import { describe, expect, it } from "vitest";
import {
  describePushError,
  isSameApplicationServerKey,
  urlBase64ToUint8Array,
} from "./use-push-notification.utils";

describe("urlBase64ToUint8Array", () => {
  it("decodes base64url (with - and _) and restores padding", () => {
    // bytes [251, 255, 191] -> base64 "+/+/" family; base64url uses - and _
    const bytes = urlBase64ToUint8Array("-_-_");
    expect(Array.from(bytes)).toEqual([251, 255, 191]);
  });

  it("decodes plain ASCII payloads", () => {
    expect(new TextDecoder().decode(urlBase64ToUint8Array("aGk"))).toBe("hi");
  });
});

describe("isSameApplicationServerKey", () => {
  const key = new Uint8Array([4, 1, 2, 3]);

  it("matches identical key bytes", () => {
    expect(
      isSameApplicationServerKey(new Uint8Array([4, 1, 2, 3]).buffer, key)
    ).toBe(true);
  });

  it("rejects a different or missing key", () => {
    expect(
      isSameApplicationServerKey(new Uint8Array([4, 9, 9, 9]).buffer, key)
    ).toBe(false);
    expect(isSameApplicationServerKey(new Uint8Array([4]).buffer, key)).toBe(
      false
    );
    expect(isSameApplicationServerKey(null, key)).toBe(false);
  });
});

describe("describePushError", () => {
  it("explains the push service refusing the subscription", () => {
    expect(
      describePushError(
        new DOMException(
          "Registration failed - push service error",
          "AbortError"
        )
      )
    ).toContain("push service refused");
  });

  it("explains blocked notifications", () => {
    expect(
      describePushError(new DOMException("denied", "NotAllowedError"))
    ).toContain("blocked");
  });

  it("falls back to the error message, then a generic message", () => {
    expect(describePushError(new Error("boom"))).toBe("boom");
    expect(describePushError("??")).toBe("Failed to enable push notifications");
  });
});
