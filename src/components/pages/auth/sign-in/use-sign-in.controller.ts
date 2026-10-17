"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { SignInValues } from "@/components/patterns/auth-form";
import { signInSchema } from "@/schemas/sign-in-schema";
import { useGoogleSignInController } from "../shared/use-google-sign-in.controller";

export interface UseSignInControllerOptions {
  redirectPath?: string;
}

/** Credentials sign-in: form, NextAuth `signIn`, toasts and redirect. */
export function useSignInController({
  redirectPath = "/dashboard",
}: UseSignInControllerOptions = {}) {
  const router = useRouter();
  const onGoogleSignIn = useGoogleSignInController();

  const form = useForm<SignInValues>({
    defaultValues: { identifier: "", password: "" },
    mode: "onChange",
    resolver: zodResolver(signInSchema),
  });

  const handleSubmit = useCallback(
    async ({ identifier, password }: SignInValues) => {
      try {
        const response = await signIn("credentials", {
          identifier,
          password,
          redirect: false,
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
