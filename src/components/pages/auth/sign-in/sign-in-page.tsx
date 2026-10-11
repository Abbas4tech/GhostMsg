"use client";

import type React from "react";
import { AuthPanel } from "@/components/blocks/auth-panel";
import { SignInForm } from "@/components/patterns/auth-form";
import { useSignInController } from "../use-auth-form.controller";

export interface SignInPageProps {
  redirectPath?: string;
}

export function SignInPage({
  redirectPath,
}: SignInPageProps): React.JSX.Element {
  const signInForm = useSignInController({ redirectPath });

  return (
    <AuthPanel
      description="Continue your journey with GhostMsg"
      title="Login to your account"
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

export default SignInPage;
