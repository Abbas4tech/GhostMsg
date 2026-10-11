import { noop } from "@/mock/noop";

export const OTP_SLOT_COUNT = 6;

export const defaultInputOtpArgs = {
  maxLength: OTP_SLOT_COUNT,
  "aria-label": "One-time password",
  disabled: false,
  onChange: noop,
  onComplete: noop,
};
