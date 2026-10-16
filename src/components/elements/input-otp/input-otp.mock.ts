import { noop } from "@/mock/noop";

export const OTP_SLOT_COUNT = 6;

export const defaultInputOtpArgs = {
  "aria-label": "One-time password",
  disabled: false,
  maxLength: OTP_SLOT_COUNT,
  onChange: noop,
  onComplete: noop,
};
