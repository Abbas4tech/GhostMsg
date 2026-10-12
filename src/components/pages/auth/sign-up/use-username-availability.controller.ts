"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import type { SignUpValues } from "@/components/patterns/auth-form";
import { authQueries } from "@/data/auth/auth.queries";
import {
  deriveUsernameAvailability,
  isCheckableUsername,
  USERNAME_DEBOUNCE_MS,
} from "./username-availability.utils";

/**
 * Debounced server-side username availability check. Writes the result back
 * into the form as a field error so submit stays disabled while taken.
 */
export function useUsernameAvailabilityController(
  form: UseFormReturn<SignUpValues>
) {
  const username = useWatch({ control: form.control, name: "username" }) ?? "";
  const [debouncedUsername, setDebouncedUsername] = useDebounceValue(
    username,
    USERNAME_DEBOUNCE_MS
  );

  useEffect(() => {
    setDebouncedUsername(username);
  }, [username, setDebouncedUsername]);

  const isCheckable = isCheckableUsername(debouncedUsername);

  const { data, isFetching, error } = useQuery({
    ...authQueries.checkUsername(debouncedUsername),
    enabled: isCheckable,
  });

  const { setError, clearErrors } = form;
  useEffect(() => {
    if (!isCheckable) {
      return;
    }
    if (error) {
      setError("username", {
        type: "manual",
        message: error.message || "Username is already taken or invalid",
      });
    } else if (data?.success) {
      clearErrors("username");
    }
  }, [error, data, isCheckable, setError, clearErrors]);

  return {
    availability: deriveUsernameAvailability({
      isFetching,
      isCheckable,
      error,
      data,
    }),
    availabilityMessage: error?.message,
  };
}
