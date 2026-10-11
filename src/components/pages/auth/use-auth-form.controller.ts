"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useCallback, useEffect } from "react";
import { type UseFormReturn, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import type {
  SignInValues,
  SignUpValues,
} from "@/components/patterns/auth-form";
import type { UsernameAvailability } from "@/components/patterns/username-field";
import { useSignUpMutation } from "@/hooks/mutations/use-sign-up-mutation";
import { authQueries } from "@/queries/auth.queries";
import { signInSchema } from "@/schemas/sign-in-schema";
import { signUpSchema } from "@/schemas/sign-up-schema";

const USERNAME_DEBOUNCE_MS = 400;
const USERNAME_MIN_LENGTH = 2;

/** Shared Google OAuth entry point for both auth pages. */
export function useGoogleSignIn(): () => void {
  return useCallback(() => {
    signIn("google");
  }, []);
}

export interface UseSignInControllerOptions {
  redirectPath?: string;
}

export function useSignInController({
  redirectPath = "/dashboard",
}: UseSignInControllerOptions = {}) {
  const router = useRouter();
  const onGoogleSignIn = useGoogleSignIn();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
    mode: "onChange",
  });

  const handleSubmit = useCallback(
    async ({ identifier, password }: SignInValues) => {
      try {
        const response = await signIn("credentials", {
          redirect: false,
          identifier,
          password,
        });

        if (response?.ok) {
          toast.success("Login successful");
          router.replace(redirectPath);
        } else {
          toast.error(response?.error || "Login failed");
        }
      } catch {
        toast.error("Login failed. Please check your credentials.");
      }
    },
    [redirectPath, router]
  );

  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
    onGoogleSignIn,
  };
}

/**
 * Debounced server-side username availability check. Writes the result back
 * into the form as a field error so submit stays disabled while taken.
 */
function useUsernameAvailability(form: UseFormReturn<SignUpValues>) {
  const username = useWatch({ control: form.control, name: "username" }) ?? "";
  const [debouncedUsername, setDebouncedUsername] = useDebounceValue(
    username,
    USERNAME_DEBOUNCE_MS
  );

  useEffect(() => {
    setDebouncedUsername(username);
  }, [username, setDebouncedUsername]);

  const isValidLength = debouncedUsername.trim().length >= USERNAME_MIN_LENGTH;

  const { data, isFetching, error } = useQuery({
    ...authQueries.checkUsername(debouncedUsername),
    enabled: isValidLength,
  });

  const { setError, clearErrors } = form;
  useEffect(() => {
    if (!isValidLength) {
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
  }, [error, data, isValidLength, setError, clearErrors]);

  let availability: UsernameAvailability = "idle";
  if (isFetching) {
    availability = "checking";
  } else if (isValidLength && (error || data?.success === false)) {
    availability = "taken";
  } else if (data?.success && !error) {
    availability = "available";
  }

  return {
    availability,
    availabilityMessage: error?.message,
  };
}

export function useSignUpController() {
  const router = useRouter();
  const onGoogleSignIn = useGoogleSignIn();
  const signUpMutation = useSignUpMutation();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: "", email: "", password: "" },
    mode: "onChange",
  });

  const { availability, availabilityMessage } = useUsernameAvailability(form);

  const { mutateAsync } = signUpMutation;
  const handleSubmit = useCallback(
    async ({ username, email, password }: SignUpValues) => {
      try {
        const res = await mutateAsync({ username, email, password });
        if (res?.success) {
          toast.success(res.message);
          router.replace(`/verify/${username}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        toast.error(message || "Signup failed");
      }
    },
    [mutateAsync, router]
  );

  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting || signUpMutation.isPending,
    onGoogleSignIn,
    usernameAvailability: availability,
    usernameAvailabilityMessage: availabilityMessage,
  };
}
