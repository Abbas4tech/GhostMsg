"use client";

import type React from "react";
import {
  DashboardAccessDenied,
  DashboardShell,
  DashboardSkeleton,
} from "@/components/blocks/dashboard-shell";
import { CommandPalette } from "@/components/patterns/command-palette";
import { ShortcutSheet } from "@/components/patterns/shortcut-sheet";
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

  if (shell.status === "loading") {
    return <DashboardSkeleton />;
  }

  if (shell.status === "unauthenticated" || !shell.username) {
    return <DashboardAccessDenied onGoToLogin={shell.handleGoToLogin} />;
  }

  return (
    <>
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
      <CommandPalette
        groups={shell.commandGroups}
        onOpenChange={shell.setIsCommandOpen}
        open={shell.isCommandOpen}
      />
      <ShortcutSheet
        onOpenChange={shell.setIsShortcutsOpen}
        open={shell.isShortcutsOpen}
      />
    </>
  );
}
