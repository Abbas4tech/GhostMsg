const SIGN_UP_PATH = "/sign-up";

/** Sign-up URL that pre-fills the claimed username (plain /sign-up when empty). */
export function buildClaimHref(username: string): string {
  const trimmed = username.trim();
  return trimmed
    ? `${SIGN_UP_PATH}?username=${encodeURIComponent(trimmed)}`
    : SIGN_UP_PATH;
}

/** "ghostmsg.app/u/" style prefix from a host, falling back to the brand host. */
export function buildLinkPrefix(host: string | undefined): string {
  return `${host || "ghostmsg.app"}/u/`;
}

/** "/u/<name>" for the landing's "See a live profile", or none when unset. */
export function buildLiveProfileHref(
  username: string | undefined
): string | undefined {
  const trimmed = username?.trim();
  return trimmed ? `/u/${encodeURIComponent(trimmed)}` : undefined;
}
