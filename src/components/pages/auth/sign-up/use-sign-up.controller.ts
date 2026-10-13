"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useIsClient } from "usehooks-ts";
import type { SignUpValues } from "@/components/patterns/auth-form";
import { useSignUpMutation } from "@/data/auth/use-sign-up-mutation";
import { signUpSchema } from "@/schemas/sign-up-schema";
import { useGoogleSignInController } from "../shared/use-google-sign-in.controller";
import { useUsernameAvailabilityController } from "./use-username-availability.controller";

export interface UseSignUpControllerOptions {
  /** Username claimed on the landing page (`/sign-up?username=`). */
  initialUsername?: string;
}

/** Sign-up: form, username availability, sign-up mutation and redirect to /verify. */
export function useSignUpController({
  initialUsername = "",
}: UseSignUpControllerOptions = {}) {
  const router = useRouter();
  const isClient = useIsClient();
  const onGoogleSignIn = useGoogleSignInController();
  const signUpMutation = useSignUpMutation();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: initialUsername, email: "", password: "" },
    mode: "onChange",
  });

  const { availability, availabilityMessage } =
    useUsernameAvailabilityController(form);

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
    linkPrefix: `${isClient ? window.location.host : "ghostmsg.app"}/u/`,
    usernameAvailability: availability,
    usernameAvailabilityMessage: availabilityMessage,
  };
}
