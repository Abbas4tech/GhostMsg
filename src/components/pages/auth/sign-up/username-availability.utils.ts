import type { UsernameAvailability } from "@/components/patterns/username-field";

export const USERNAME_DEBOUNCE_MS = 400;
export const USERNAME_MIN_LENGTH = 2;

/** True once the (debounced) username is long enough to check on the server. */
export const isCheckableUsername = (username: string): boolean =>
  username.trim().length >= USERNAME_MIN_LENGTH;

export interface AvailabilityInput {
  data?: { success?: boolean } | null;
  error?: unknown;
  isCheckable: boolean;
  isFetching: boolean;
}

/** Maps the check-username query state to the UsernameField indicator. */
export function deriveUsernameAvailability({
  isFetching,
  isCheckable,
  error,
  data,
}: AvailabilityInput): UsernameAvailability {
  if (isFetching) {
    return "checking";
  }
  if (isCheckable && (error || data?.success === false)) {
    return "taken";
  }
  if (data?.success && !error) {
    return "available";
  }
  return "idle";
}
