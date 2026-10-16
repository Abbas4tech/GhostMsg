"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { authQueries } from "@/data/auth/auth.queries";
import { useChangeUsernameMutation } from "@/data/user/use-change-username-mutation";
import {
  deriveUsernameAvailability,
  isCheckableUsername,
  USERNAME_DEBOUNCE_MS,
} from "@/lib/users/username-availability";

/**
 * Change-username dialog: debounced availability check, the mutation and a
 * NextAuth session refresh so the new link shows everywhere at once.
 */
export function useChangeUsernameController(currentUsername: string) {
  const router = useRouter();
  const { update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [debounced] = useDebounceValue(value.trim(), USERNAME_DEBOUNCE_MS);

  const isUnchanged = debounced === currentUsername;
  const isCheckable = isCheckableUsername(debounced) && !isUnchanged;
  const { data, error, isFetching } = useQuery({
    ...authQueries.checkUsername(debounced),
    enabled: isCheckable,
  });
  const isStale = value.trim() !== debounced;
  const availability = isStale
    ? "checking"
    : deriveUsernameAvailability({ data, error, isCheckable, isFetching });

  const mutation = useChangeUsernameMutation();
  const { mutateAsync } = mutation;

  const open = useCallback(() => {
    setValue(currentUsername);
    setIsOpen(true);
  }, [currentUsername]);

  const handleSubmit = useCallback(async () => {
    try {
      const result = await mutateAsync(value.trim());
      await update({ username: result.username });
      setIsOpen(false);
      router.refresh();
    } catch {
      // Toasted by the mutation
    }
  }, [mutateAsync, value, update, router]);

  return {
    isOpen,
    open,
    setIsOpen,
    value,
    setValue,
    // The current username is never "checking" or "taken" (it is theirs).
    availability: value.trim() === currentUsername ? "idle" : availability,
    errorMessage: error?.message,
    isSaving: mutation.isPending,
    handleSubmit,
  } as const;
}
