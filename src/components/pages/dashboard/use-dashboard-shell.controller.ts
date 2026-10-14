"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CommandGroupDefinition } from "@/components/patterns/command-palette";
import { messagesQueries } from "@/data/messages/messages.queries";
import { useAcceptMessageMutation } from "@/data/user/use-accept-message-mutation";
import { userQueries } from "@/data/user/user.queries";
import { getActiveNav } from "./dashboard.utils";
import { useProfileLinkController } from "./use-profile-link.controller";

/**
 * Dashboard frame: session gate, unread badge, Message Acceptance, the
 * profile link card, ⌘K command palette and sign-out.
 */
export function useDashboardShellController() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const link = useProfileLinkController();
  const isAuthenticated = status === "authenticated";

  // Server counts: correct however many messages exist (no list download).
  const { data: countsData } = useQuery({
    ...messagesQueries.counts(),
    enabled: isAuthenticated,
  });
  const unreadCount = countsData?.counts.unread ?? 0;

  const { data: acceptanceData } = useQuery({
    ...userQueries.acceptance(),
    enabled: isAuthenticated,
  });
  const { data: profileData } = useQuery({
    ...userQueries.profile(),
    enabled: isAuthenticated,
  });
  const acceptMutation = useAcceptMessageMutation();
  const isAccepting = Boolean(acceptanceData?.isAcceptingMessage ?? true);
  const { mutate: setAccepting } = acceptMutation;
  const handleToggleAcceptance = useCallback(() => {
    setAccepting(!isAccepting);
  }, [setAccepting, isAccepting]);

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const handleOpenCommand = useCallback(() => setIsCommandOpen(true), []);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  const handleGoToLogin = useCallback(() => {
    router.push("/sign-in");
  }, [router]);

  const commandGroups = useMemo<CommandGroupDefinition[]>(
    () => [
      {
        heading: "Actions",
        items: [
          {
            id: "copy-link",
            label: "Copy my Public Profile Link",
            onSelect: link.handleCopy,
          },
          {
            id: "acceptance",
            label: isAccepting
              ? "Pause Message Acceptance"
              : "Resume Message Acceptance",
            onSelect: handleToggleAcceptance,
          },
          {
            id: "visit",
            label: "View my public profile",
            onSelect: () => router.push(`/u/${link.username}`),
          },
        ],
      },
      {
        heading: "Go to",
        items: [
          {
            id: "inbox",
            label: "Inbox",
            onSelect: () => router.push("/dashboard"),
          },
          {
            id: "inbox-unread",
            label: "Inbox · Unread",
            onSelect: () => router.push("/dashboard?filter=unread"),
          },
          {
            id: "inbox-starred",
            label: "Inbox · Starred",
            onSelect: () => router.push("/dashboard?filter=starred"),
          },
          {
            id: "profile",
            label: "Profile",
            onSelect: () => router.push("/dashboard/profile"),
          },
          {
            id: "settings",
            label: "Settings",
            onSelect: () => router.push("/dashboard/settings"),
          },
        ],
      },
    ],
    [
      link.handleCopy,
      link.username,
      isAccepting,
      handleToggleAcceptance,
      router,
    ]
  );

  return {
    status,
    username: link.username,
    activeNav: getActiveNav(pathname),
    unreadCount,
    avatarUrl: profileData?.profile.avatarUrl ?? null,
    profileLink: {
      label: link.profileLabel,
      onCopy: link.handleCopy,
      onShare: link.handleShare,
    },
    acceptance: {
      isAccepting,
      isPending: acceptMutation.isPending,
      onToggle: handleToggleAcceptance,
    },
    isCommandOpen,
    setIsCommandOpen,
    handleOpenCommand,
    commandGroups,
    handleSignOut,
    handleGoToLogin,
  };
}
