import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { ClaimLinkFormProps } from "./claim-link-form";

export const defaultClaimLinkFormArgs: ClaimLinkFormProps = {
  linkPrefix: "ghostmsg.app/u/",
  liveProfileHref: `/u/${FIXTURE_USERNAME}`,
  onSubmit: noop,
  onValueChange: noop,
  value: "",
};

export const filledClaimLinkFormArgs = {
  value: FIXTURE_USERNAME,
} satisfies Partial<ClaimLinkFormProps>;
