import { noop } from "@/mock/noop";
import type { VerifyCodeError } from "./verify-code-form";

export const VALID_OTP = "123456";

export interface VerifyCodeFormStoryArgs {
  codeError?: VerifyCodeError | null;
  isResending: boolean;
  isSubmitting: boolean;
  needsNewCode: boolean;
  onResend: () => void;
  onSubmit: (values: { code: string }) => void;
  resendSecondsLeft: number;
}

export const defaultVerifyCodeFormArgs: VerifyCodeFormStoryArgs = {
  codeError: null,
  isResending: false,
  isSubmitting: false,
  needsNewCode: false,
  onResend: noop,
  onSubmit: noop,
  resendSecondsLeft: 42,
};

/** Design MobVerifyError: a wrong code with two tries left. */
export const wrongCodeError: VerifyCodeError = {
  detail: "2 tries left. Check for the newest email.",
  title: "That code isn't right.",
};

export const lockedCodeError: VerifyCodeError = {
  detail: "Get a new code to try again.",
  title: "Too many tries.",
};
