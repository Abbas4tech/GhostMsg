import type { DashboardNavId } from "@/components/blocks/dashboard-shell";

const PROTOCOL_PATTERN = /^https?:\/\//;

/** Sidebar item for the current dashboard route. */
export function getActiveNav(pathname: string | null): DashboardNavId {
  if (pathname?.startsWith("/dashboard/profile")) {
    return "profile";
  }
  if (pathname?.startsWith("/dashboard/settings")) {
    return "settings";
  }
  return "inbox";
}

/** "https://ghostmsg.app/u/maya" → "ghostmsg.app/u/maya" for display. */
export const stripProtocol = (url: string): string =>
  url.replace(PROTOCOL_PATTERN, "");

/** "ghostmsg.app/u/maya" → "ghostmsg.app/u/" (everything up to the username). */
export const toLinkPrefix = (profileLabel: string): string =>
  profileLabel.slice(0, profileLabel.lastIndexOf("/") + 1);
