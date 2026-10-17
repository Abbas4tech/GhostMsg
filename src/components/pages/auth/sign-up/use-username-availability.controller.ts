"use client";

import { useQuery } from "@tanstack/react-query";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import type { SignUpValues } from "@/components/patterns/auth-form";
import { authQueries } from "@/data/auth/auth.queries";
import {
  deriveUsernameAvailability,
  isCheckableUsername,
  USERNAME_DEBOUNCE_MS,
} from "@/lib/users/username-availability";

/**
 * Debounced server-side username availability check. The result is shown by
 * the username field and blocks submit while taken; it is derived from the
 * query, never written into form state.
 */
export function useUsernameAvailabilityController(
  form: UseFormReturn<SignUpValues>
) {
  const username = useWatch({ control: form.control, name: "username" }) ?? "";
  const [debouncedUsername] = useDebounceValue(username, USERNAME_DEBOUNCE_MS);

  const isCheckable = isCheckableUsername(debouncedUsername);

  const { data, isFetching, error } = useQuery({
    ...authQueries.checkUsername(debouncedUsername),
    enabled: isCheckable,
  });

  return {
    availability: deriveUsernameAvailability({
      data,
      error,
      isCheckable,
      isFetching,
    }),
    availabilityMessage: error?.message,
  };
}
