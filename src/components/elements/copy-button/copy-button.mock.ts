import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { CopyButtonProps } from "./copy-button";

export const defaultCopyButtonArgs: CopyButtonProps = {
  content: `https://ghostmsg.app/u/${FIXTURE_USERNAME}`,
  delay: 3000,
  onClick: noop,
  onCopiedChange: noop,
  size: "default",
  variant: "default",
};
