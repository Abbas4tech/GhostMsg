"use client";

import type React from "react";
import { AuthPanel } from "@/components/blocks/auth-panel";
import { SignUpForm } from "@/components/patterns/auth-form";
import { useSignUpController } from "./use-sign-up.controller";

export function SignUpPage(): React.JSX.Element {
  const signUpForm = useSignUpController();

  return (
    <AuthPanel
      description="Enter your details below to signup for your account"
      title="Join GhostMsg"
    >
      <SignUpForm
        form={signUpForm.form}
        isSubmitting={signUpForm.isSubmitting}
        onGoogleSignIn={signUpForm.onGoogleSignIn}
        onSubmit={signUpForm.handleSubmit}
        usernameAvailability={signUpForm.usernameAvailability}
        usernameAvailabilityMessage={signUpForm.usernameAvailabilityMessage}
      />
    </AuthPanel>
  );
}

export default SignUpPage;
