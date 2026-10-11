"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import type React from "react";
import { useCallback } from "react";
import {
  DashboardAccessDenied,
  DashboardShell,
  DashboardSkeleton,
} from "@/components/blocks/dashboard-shell";

// Tabs are code-split exactly like before; each one owns its own controller,
// so its queries only run once that tab is rendered.
const InboxTab = dynamic(() => import("./inbox-tab").then((m) => m.InboxTab));
const ProfileTab = dynamic(() =>
  import("./profile-tab").then((m) => m.ProfileTab)
);
const SettingsTab = dynamic(() =>
  import("./settings-tab").then((m) => m.SettingsTab)
);

const SIGN_IN_PATH = "/sign-in";

export function DashboardPage(): React.JSX.Element {
  const { data: session, status } = useSession();

  const handleGoToLogin = useCallback(() => {
    window.location.assign(SIGN_IN_PATH);
  }, []);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "unauthenticated" || !session?.user) {
    return <DashboardAccessDenied onGoToLogin={handleGoToLogin} />;
  }

  return (
    <DashboardShell
      messages={<InboxTab />}
      profile={<ProfileTab />}
      settings={<SettingsTab />}
      username={session.user.username ?? ""}
    />
  );
}

export default DashboardPage;
