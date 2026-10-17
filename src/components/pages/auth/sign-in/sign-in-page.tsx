"use client";

import type React from "react";
import { AuthPanel } from "@/components/blocks/auth-panel";
import { SignInForm } from "@/components/patterns/auth-form";
import { useSignInController } from "./use-sign-in.controller";

export interface SignInPageProps {
  redirectPath?: string;
}

export function SignInPage({
  redirectPath,
}: SignInPageProps): React.JSX.Element {
  const signInForm = useSignInController({ redirectPath });

  return (
    <AuthPanel
      description="Sign in to read your Anonymous Messages."
      title="Welcome back"
    >
      <SignInForm
        form={signInForm.form}
        isSubmitting={signInForm.isSubmitting}
        onGoogleSignIn={signInForm.onGoogleSignIn}
        onSubmit={signInForm.handleSubmit}
      />
    </AuthPanel>
  );
}
