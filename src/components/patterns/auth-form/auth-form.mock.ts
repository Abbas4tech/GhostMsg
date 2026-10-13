import type { UsernameAvailability } from "@/components/patterns/username-field";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { AuthFormFooterProps } from "./auth-form-footer";

export const validSignIn = {
  identifier: FIXTURE_USERNAME,
  password: "secret123",
};

export const validSignUp = {
  username: FIXTURE_USERNAME,
  email: "johndoe@example.com",
  password: "secret123",
};

export interface SignInFormStoryArgs {
  isSubmitting: boolean;
  onGoogleSignIn: () => void;
  onSubmit: (values: typeof validSignIn) => void;
}

export interface SignUpFormStoryArgs {
  isSubmitting: boolean;
  onGoogleSignIn: () => void;
  onSubmit: (values: typeof validSignUp) => void;
  usernameAvailability: UsernameAvailability;
  usernameAvailabilityMessage?: string;
}

export const defaultSignInFormArgs: SignInFormStoryArgs = {
  isSubmitting: false,
  onGoogleSignIn: noop,
  onSubmit: noop,
};

export const defaultSignUpFormArgs: SignUpFormStoryArgs = {
  isSubmitting: false,
  usernameAvailability: "idle",
  onGoogleSignIn: noop,
  onSubmit: noop,
};

export const defaultAuthFormFooterArgs: AuthFormFooterProps = {
  submitLabel: "Sign in",
  submittingLabel: "Signing in...",
  submitVariant: "default",
  alternatePrompt: "New here?",
  alternateHref: "/sign-up",
  alternateLabel: "Get your link",
  isSubmitting: false,
  isSubmitDisabled: false,
};
