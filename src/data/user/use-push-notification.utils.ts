const DASH_REGEX = /-/g;
const UNDERSCORE_REGEX = /_/g;

/** Converts a base64url VAPID public key to the `Uint8Array` PushManager expects. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(DASH_REGEX, "+")
    .replace(UNDERSCORE_REGEX, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * True when an existing subscription was created with the same VAPID key.
 * A subscription made with another key (e.g. after rotating keys) makes
 * `pushManager.subscribe` throw `InvalidStateError`, so it must be replaced.
 */
export function isSameApplicationServerKey(
  existing: ArrayBuffer | null | undefined,
  expected: Uint8Array
): boolean {
  if (!existing) {
    return false;
  }
  const actual = new Uint8Array(existing);
  return (
    actual.length === expected.length &&
    actual.every((byte, index) => byte === expected[index])
  );
}

export const PUSH_NOT_CONFIGURED_MESSAGE =
  "Push notifications aren't configured on this server (missing NEXT_PUBLIC_VAPID_PUBLIC_KEY).";

const DOM_ERROR_MESSAGES: Record<string, string> = {
  AbortError:
    "Your browser's push service refused the subscription. In Brave, turn on “Use Google services for push messaging” (brave://settings/privacy). Push also doesn't work in private or incognito windows.",
  InvalidAccessError:
    "The server's push key is invalid. Check NEXT_PUBLIC_VAPID_PUBLIC_KEY.",
  InvalidStateError:
    "This browser has a stale push subscription. Reload the page and try again.",
  NotAllowedError:
    "Notifications are blocked for this site. Allow them in your browser's site settings, then try again.",
  NotSupportedError:
    "Push needs a secure origin (HTTPS or localhost) and a registered service worker.",
  SecurityError:
    "Push needs a secure origin (HTTPS or localhost) and a registered service worker.",
};

/** A user-facing message for a failure while enabling push. */
export function describePushError(error: unknown): string {
  if (error instanceof DOMException && DOM_ERROR_MESSAGES[error.name]) {
    return DOM_ERROR_MESSAGES[error.name];
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Failed to enable push notifications";
}
