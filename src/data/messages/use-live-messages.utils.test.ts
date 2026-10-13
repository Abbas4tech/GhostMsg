import { describe, expect, it } from "vitest";
import {
  buildLiveMessageToast,
  HIDDEN_LIVE_TOAST_TITLE,
  LIVE_TOAST_TITLE,
} from "./use-live-messages.utils";

const LONG_CONTENT =
  "This is a long anonymous message that goes well past forty characters.";

describe("buildLiveMessageToast", () => {
  it("stays silent for a quarantined message, whatever the settings", () => {
    expect(
      buildLiveMessageToast({ content: "rude", isQuarantined: true }, false)
    ).toBeNull();
    expect(
      buildLiveMessageToast({ content: "rude", isQuarantined: true }, true)
    ).toBeNull();
  });

  it("shows no text when the recipient hides message text", () => {
    expect(buildLiveMessageToast({ content: "hello there" }, true)).toEqual({
      title: HIDDEN_LIVE_TOAST_TITLE,
    });
  });

  it("previews short messages in full and truncates long ones", () => {
    expect(buildLiveMessageToast({ content: "hello there" }, false)).toEqual({
      title: LIVE_TOAST_TITLE,
      description: "hello there",
    });
    expect(
      buildLiveMessageToast({ content: LONG_CONTENT }, false)?.description
    ).toBe(`${LONG_CONTENT.slice(0, 40)}…`);
  });

  it("falls back to the neutral title when content is missing", () => {
    expect(buildLiveMessageToast({}, false)).toEqual({
      title: HIDDEN_LIVE_TOAST_TITLE,
    });
  });
});
