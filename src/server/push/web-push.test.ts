import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendNotification, updateOne } = vi.hoisted(() => ({
  sendNotification: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("web-push", () => {
  class WebPushError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  return { default: { sendNotification }, WebPushError };
});
vi.mock("@/server/models/user.model", () => ({ default: { updateOne } }));

import { WebPushError } from "web-push";
import {
  disablePushWhenNoDevices,
  getVapidConfig,
  isGoneError,
  sendPushToUser,
} from "./web-push";

const subscription = (endpoint: string) => ({
  endpoint,
  keys: { p256dh: "p256dh", auth: "auth" },
  createdAt: new Date(0),
});

const PAYLOAD = { title: "New anonymous message", body: "hi" };
const pushError = (statusCode: number) =>
  new (WebPushError as unknown as new (m: string, s: number) => Error)(
    "push failed",
    statusCode
  );

describe("getVapidConfig", () => {
  it("returns null unless both keys are set", () => {
    expect(getVapidConfig({ NEXT_PUBLIC_VAPID_PUBLIC_KEY: "pub" })).toBeNull();
    expect(getVapidConfig({ VAPID_PRIVATE_KEY: "priv" })).toBeNull();
  });

  it("defaults the subject", () => {
    expect(
      getVapidConfig({
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: "pub",
        VAPID_PRIVATE_KEY: "priv",
      })
    ).toEqual({
      publicKey: "pub",
      privateKey: "priv",
      subject: "mailto:support@ghostmsg.app",
    });
  });
});

describe("isGoneError", () => {
  it("treats 404 and 410 as gone, other statuses as transient", () => {
    expect(isGoneError(pushError(410))).toBe(true);
    expect(isGoneError(pushError(404))).toBe(true);
    expect(isGoneError(pushError(500))).toBe(false);
    expect(isGoneError(new Error("network"))).toBe(false);
  });
});

describe("sendPushToUser", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "pub");
    vi.stubEnv("VAPID_PRIVATE_KEY", "priv");
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("does nothing when VAPID is not configured", async () => {
    vi.stubEnv("VAPID_PRIVATE_KEY", "");

    const result = await sendPushToUser("u1", [subscription("a")], PAYLOAD);

    expect(result).toEqual({ sent: 0, removed: 0 });
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("sends the JSON payload to every device with VAPID details", async () => {
    sendNotification.mockResolvedValue({});

    const result = await sendPushToUser(
      "u1",
      [subscription("a"), subscription("b")],
      PAYLOAD
    );

    expect(result).toEqual({ sent: 2, removed: 0 });
    expect(sendNotification).toHaveBeenCalledWith(
      { endpoint: "a", keys: { p256dh: "p256dh", auth: "auth" } },
      JSON.stringify(PAYLOAD),
      expect.objectContaining({
        vapidDetails: expect.objectContaining({
          publicKey: "pub",
          privateKey: "priv",
        }),
      })
    );
    expect(updateOne).not.toHaveBeenCalled();
  });

  it("prunes subscriptions the push service reports as gone", async () => {
    sendNotification
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(pushError(410))
      .mockRejectedValueOnce(pushError(500));

    const result = await sendPushToUser(
      "u1",
      [subscription("ok"), subscription("gone"), subscription("flaky")],
      PAYLOAD
    );

    expect(result).toEqual({ sent: 1, removed: 1 });
    expect(updateOne).toHaveBeenCalledWith(
      { _id: "u1" },
      { $pull: { pushSubscriptions: { endpoint: { $in: ["gone"] } } } }
    );
    // Push turns off for the account only when no device is left.
    expect(updateOne).toHaveBeenCalledWith(
      { _id: "u1", pushSubscriptions: { $size: 0 } },
      { $set: { "notificationSettings.webPushEnabled": false } }
    );
  });

  it("disablePushWhenNoDevices only matches users without subscriptions", async () => {
    await disablePushWhenNoDevices("u2");

    expect(updateOne).toHaveBeenCalledWith(
      { _id: "u2", pushSubscriptions: { $size: 0 } },
      { $set: { "notificationSettings.webPushEnabled": false } }
    );
  });
});
