"use client";

import type React from "react";
import { AuthPanel } from "@/components/blocks/auth-panel";
import { SignUpForm } from "@/components/patterns/auth-form";
import { useSignUpController } from "./use-sign-up.controller";

export interface SignUpPageProps {
  /** Username claimed on the landing page. */
  initialUsername?: string;
}

/** Sign-up is step 1 of 2; the Verification Code is step 2. */
const SIGN_UP_STEP = { current: 1, total: 2 } as const;

export function SignUpPage({
  initialUsername,
}: SignUpPageProps): React.JSX.Element {
  const signUpForm = useSignUpController({ initialUsername });

  return (
    <AuthPanel
      backHref="/"
      description="Pick a username. That's your link."
      step={SIGN_UP_STEP}
      title="Make your link"
    >
      <SignUpForm
        form={signUpForm.form}
        isSubmitting={signUpForm.isSubmitting}
        linkPrefix={signUpForm.linkPrefix}
        onGoogleSignIn={signUpForm.onGoogleSignIn}
        onSubmit={signUpForm.handleSubmit}
        usernameAvailability={signUpForm.usernameAvailability}
        usernameAvailabilityMessage={signUpForm.usernameAvailabilityMessage}
      />
    </AuthPanel>
  );
}
