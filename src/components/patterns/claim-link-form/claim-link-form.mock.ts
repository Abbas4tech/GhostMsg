import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { ClaimLinkFormProps } from "./claim-link-form";

export const defaultClaimLinkFormArgs: ClaimLinkFormProps = {
  linkPrefix: "ghostmsg.app/u/",
  value: "",
  onValueChange: noop,
  onSubmit: noop,
  liveProfileHref: `/u/${FIXTURE_USERNAME}`,
};

export const filledClaimLinkFormArgs = {
  value: FIXTURE_USERNAME,
} satisfies Partial<ClaimLinkFormProps>;
