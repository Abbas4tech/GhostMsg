import { noop } from "@/mock/noop";
import type { SiteHeaderProps } from "./site-header";

export const guestSiteHeaderArgs: SiteHeaderProps = {
  isAuthenticated: false,
  onSignOut: noop,
};

export const signedInSiteHeaderArgs = {
  isAuthenticated: true,
} satisfies Partial<SiteHeaderProps>;
