import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { DashboardAccessDeniedProps } from "./dashboard-access-denied";
import type { DashboardShellProps } from "./dashboard-shell";

export const dashboardShellSlotText = "Routed page content";

export const defaultDashboardShellArgs: Omit<DashboardShellProps, "children"> =
  {
    activeNav: "inbox",
    unreadCount: 3,
    username: FIXTURE_USERNAME,
    profileLink: {
      label: `ghostmsg.app/u/${FIXTURE_USERNAME}`,
      onCopy: noop,
      onShare: noop,
    },
    acceptance: { isAccepting: true, isPending: false, onToggle: noop },
    onOpenCommand: noop,
    onSignOut: noop,
  };

export const pausedDashboardShellArgs = {
  acceptance: { isAccepting: false, isPending: false, onToggle: noop },
  unreadCount: 0,
} satisfies Partial<DashboardShellProps>;

export const defaultDashboardAccessDeniedArgs: DashboardAccessDeniedProps = {
  onGoToLogin: noop,
};
