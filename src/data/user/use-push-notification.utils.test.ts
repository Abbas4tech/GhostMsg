import { describe, expect, it } from "vitest";
import { urlBase64ToUint8Array } from "./use-push-notification.utils";

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
