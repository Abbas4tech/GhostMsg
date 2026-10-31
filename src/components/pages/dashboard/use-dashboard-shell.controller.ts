"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Copy,
  ExternalLink,
  Inbox,
  Mail,
  Pause,
  Play,
  Settings,
  Star,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CommandGroupDefinition } from "@/components/patterns/command-palette";
import { messagesQueries } from "@/data/messages/messages.queries";
import { useAcceptMessageMutation } from "@/data/user/use-accept-message-mutation";
import { userQueries } from "@/data/user/user.queries";
import { getActiveNav } from "./dashboard.utils";
import { useGlobalShortcutsController } from "./use-global-shortcuts.controller";
import { useProfileLinkController } from "./use-profile-link.controller";

/**
 * Dashboard frame: session gate, unread badge, Message Acceptance, the
 * profile link card, ⌘K command palette, page-wide shortcuts (g-chords, ⇧C,
 * the `?` sheet) and sign-out.
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

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const handleOpenShortcuts = useCallback(() => setIsShortcutsOpen(true), []);
  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );
  useGlobalShortcutsController({
    onCopyLink: link.handleCopy,
    onNavigate: handleNavigate,
    onOpenShortcuts: handleOpenShortcuts,
  });

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
            icon: createElement(Copy),
            id: "copy-link",
            label: "Copy my Public Profile Link",
            onSelect: link.handleCopy,
            shortcut: "⇧C",
          },
          {
            icon: createElement(isAccepting ? Pause : Play),
            id: "acceptance",
            label: isAccepting
              ? "Pause Message Acceptance"
              : "Resume Message Acceptance",
            onSelect: handleToggleAcceptance,
          },
          {
            icon: createElement(ExternalLink),
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
            icon: createElement(Inbox),
            id: "inbox",
            label: "Inbox",
            onSelect: () => router.push("/dashboard"),
            shortcut: "g i",
          },
          {
            icon: createElement(Mail),
            id: "inbox-unread",
            label: "Inbox · Unread",
            onSelect: () => router.push("/dashboard?filter=unread"),
          },
          {
            icon: createElement(Star),
            id: "inbox-starred",
            label: "Inbox · Starred",
            onSelect: () => router.push("/dashboard?filter=starred"),
          },
          {
            icon: createElement(User),
            id: "profile",
            label: "Profile",
            onSelect: () => router.push("/dashboard/profile"),
            shortcut: "g p",
          },
          {
            icon: createElement(Settings),
            id: "settings",
            label: "Settings",
            onSelect: () => router.push("/dashboard/settings"),
            shortcut: "g s",
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
    acceptance: {
      isAccepting,
      isPending: acceptMutation.isPending,
      onToggle: handleToggleAcceptance,
    },
    activeNav: getActiveNav(pathname),
    avatarUrl: profileData?.profile.avatarUrl ?? null,
    commandGroups,
    handleGoToLogin,
    handleOpenCommand,
    handleOpenShortcuts,
    handleSignOut,
    isCommandOpen,
    isShortcutsOpen,
    profileLink: {
      label: link.profileLabel,
      onCopy: link.handleCopy,
      onShare: link.handleShare,
    },
    setIsCommandOpen,
    setIsShortcutsOpen,
    status,
    unreadCount,
    username: link.username,
  };
}
