"use client";

import type React from "react";
import { AuthPanel } from "@/components/blocks/auth-panel";
import { SignUpForm } from "@/components/patterns/auth-form";
import { useSignUpController } from "./use-sign-up.controller";

export interface SignUpPageProps {
  /** Username claimed on the landing page. */
  initialUsername?: string;
}

export function SignUpPage({
  initialUsername,
}: SignUpPageProps): React.JSX.Element {
  const signUpForm = useSignUpController({ initialUsername });

  return (
    <AuthPanel
      description="Pick a username. That's your link."
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

export default SignUpPage;
