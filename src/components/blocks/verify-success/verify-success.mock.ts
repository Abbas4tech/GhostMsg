import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { VerifySuccessProps } from "./verify-success";

export const defaultVerifySuccessArgs: VerifySuccessProps = {
  onCopy: noop,
  onShare: noop,
  profileUrl: `https://ghostmsg.app/u/${FIXTURE_USERNAME}`,
};
