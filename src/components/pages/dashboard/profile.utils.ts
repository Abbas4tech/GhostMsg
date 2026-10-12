/** Public profile URL for a recipient (`<origin>/u/<username>`). */
export function buildProfileUrl(
  origin: string,
  username: string | undefined | null
): string {
  return `${origin}/u/${username ?? ""}`;
}
