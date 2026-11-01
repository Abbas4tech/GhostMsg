"use client";

import type React from "react";
import {
  DashboardAccessDenied,
  DashboardShell,
  DashboardSkeleton,
} from "@/components/blocks/dashboard-shell";
import { MotionLayoutProvider } from "@/providers/motion-layout-provider";
import {
  LazyCommandPalette,
  LazyShortcutSheet,
  MountOnFirstOpen,
  usePrefetchShellOverlays,
} from "./lazy-overlays";
import { useDashboardShellController } from "./use-dashboard-shell.controller";

export interface DashboardLayoutProps {
  /** The routed dashboard page (Inbox, Profile or Settings). */
  children: React.ReactNode;
}

/** Session gate + sidebar shell + ⌘K palette + `?` shortcut sheet around every dashboard route. */
export function DashboardLayout({
  children,
}: DashboardLayoutProps): React.JSX.Element {
  const shell = useDashboardShellController();
  usePrefetchShellOverlays();

  if (shell.status === "loading") {
    return <DashboardSkeleton />;
  }

  if (shell.status === "unauthenticated" || !shell.username) {
    return <DashboardAccessDenied onGoToLogin={shell.handleGoToLogin} />;
  }

  return (
    <MotionLayoutProvider>
      <DashboardShell
        acceptance={shell.acceptance}
        activeNav={shell.activeNav}
        avatarUrl={shell.avatarUrl}
        onOpenCommand={shell.handleOpenCommand}
        onSignOut={shell.handleSignOut}
        profileLink={shell.profileLink}
        unreadCount={shell.unreadCount}
        username={shell.username}
      >
        {children}
      </DashboardShell>
      <MountOnFirstOpen open={shell.isCommandOpen}>
        <LazyCommandPalette
          groups={shell.commandGroups}
          onOpenChange={shell.setIsCommandOpen}
          open={shell.isCommandOpen}
        />
      </MountOnFirstOpen>
      <MountOnFirstOpen open={shell.isShortcutsOpen}>
        <LazyShortcutSheet
          onOpenChange={shell.setIsShortcutsOpen}
          open={shell.isShortcutsOpen}
        />
      </MountOnFirstOpen>
    </MotionLayoutProvider>
  );
}
