"use client";

import { signIn } from "next-auth/react";
import { useCallback } from "react";

/** Google OAuth entry point shared by the sign-in and sign-up pages. */
export function useGoogleSignInController(): () => void {
  return useCallback(() => {
    signIn("google");
  }, []);
}
