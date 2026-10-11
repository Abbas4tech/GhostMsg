import { noop } from "@/mock/noop";

export const VALID_OTP = "123456";

export interface VerifyCodeFormStoryArgs {
  isSubmitting: boolean;
  onSubmit: (values: { code: string }) => void;
}

export const defaultVerifyCodeFormArgs: VerifyCodeFormStoryArgs = {
  isSubmitting: false,
  onSubmit: noop,
};
