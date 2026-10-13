import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { ShareLinkCardProps } from "./share-link-card";

export const defaultShareLinkCardArgs: ShareLinkCardProps = {
  profileUrl: `https://ghostmsg.app/u/${FIXTURE_USERNAME}`,
  onCopy: noop,
};

export const longUrlShareLinkCardArgs = {
  profileUrl: "https://ghost-msg.vercel.app/u/a_really_long_username_20",
} satisfies Partial<ShareLinkCardProps>;
