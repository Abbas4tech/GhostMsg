"use client";

import { Ghost } from "lucide-react";
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
      backHref="/"
      description="Your inbox missed you."
      icon={<Ghost aria-hidden="true" />}
      iconTone="brand"
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
