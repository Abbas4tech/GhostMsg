import type { UpdateProfileBody } from "@/data/user/use-update-profile-mutation";

/** Public profile URL for a recipient (`<origin>/u/<username>`). */
export function buildProfileUrl(
  origin: string,
  username: string | undefined | null
): string {
  return `${origin}/u/${username ?? ""}`;
}

/** The editable profile. `avatarUrl: null` means "no photo". */
export interface ProfileFormValues {
  amaPrompt: string;
  avatarUrl: string | null;
  displayName: string;
  showAmaBanner: boolean;
}

export type ProfileDirtyFields = Partial<
  Record<keyof ProfileFormValues, boolean | undefined>
>;

/** Only the changed fields, trimmed; a blank AMA Prompt is never sent. */
export function buildProfilePatch(
  values: ProfileFormValues,
  dirty: ProfileDirtyFields
): UpdateProfileBody {
  const patch: UpdateProfileBody = {};
  if (dirty.displayName) {
    patch.displayName = values.displayName.trim();
  }
  if (dirty.avatarUrl) {
    patch.avatarUrl = values.avatarUrl;
  }
  if (dirty.showAmaBanner) {
    patch.showAmaBanner = values.showAmaBanner;
  }
  const amaPrompt = values.amaPrompt.trim();
  if (dirty.amaPrompt && amaPrompt) {
    patch.amaPrompt = amaPrompt;
  }
  return patch;
}
