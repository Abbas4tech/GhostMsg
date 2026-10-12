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
