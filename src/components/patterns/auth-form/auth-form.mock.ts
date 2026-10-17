import type { UsernameAvailability } from "@/components/patterns/username-field";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { AuthFormFooterProps } from "./auth-form-footer";

export const validSignIn = {
  identifier: FIXTURE_USERNAME,
  password: "secret123",
};

export const validSignUp = {
  email: "johndoe@example.com",
  password: "secret123",
  username: FIXTURE_USERNAME,
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
  onGoogleSignIn: noop,
  onSubmit: noop,
  usernameAvailability: "idle",
};

export const defaultAuthFormFooterArgs: AuthFormFooterProps = {
  alternateHref: "/sign-up",
  alternateLabel: "Get your link",
  alternatePrompt: "New here?",
  isSubmitDisabled: false,
  isSubmitting: false,
  submitLabel: "Sign in",
  submittingLabel: "Signing in...",
  submitVariant: "default",
};
