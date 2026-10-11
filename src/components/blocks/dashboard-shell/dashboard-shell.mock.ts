import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { DashboardAccessDeniedProps } from "./dashboard-access-denied";
import type { DashboardShellProps } from "./dashboard-shell";

export const dashboardShellSlotText = {
  messages: "Messages tab content",
  profile: "Profile tab content",
  settings: "Settings tab content",
};

export const defaultDashboardShellArgs: Omit<
  DashboardShellProps,
  "messages" | "profile" | "settings"
> = {
  username: FIXTURE_USERNAME,
  defaultTab: "messages",
};

export const defaultDashboardAccessDeniedArgs: DashboardAccessDeniedProps = {
  onGoToLogin: noop,
};
