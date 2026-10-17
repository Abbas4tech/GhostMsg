"use client";

import {
  CopyIcon,
  InboxIcon,
  LogOutIcon,
  SearchIcon,
  Share2Icon,
  SlidersHorizontalIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useCallback, useId } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/elements/avatar";
import { Button } from "@/components/elements/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/elements/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/elements/item";
import { Kbd } from "@/components/elements/kbd";
import { PalettePickerButton } from "@/components/elements/palette-picker";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  useSidebar,
} from "@/components/elements/sidebar";
import { Switch } from "@/components/elements/switch";
import { ThemeTogglerButton } from "@/components/elements/theme-toggler";
import { BrandMark } from "@/components/patterns/brand-mark";
import { cn } from "@/lib/utils";

export type DashboardNavId = "inbox" | "profile" | "settings";

const NAV_ITEMS: {
  href: string;
  icon: typeof InboxIcon;
  id: DashboardNavId;
  label: string;
}[] = [
  { href: "/dashboard", icon: InboxIcon, id: "inbox", label: "Inbox" },
  {
    href: "/dashboard/profile",
    icon: UserIcon,
    id: "profile",
    label: "Profile",
  },
  {
    href: "/dashboard/settings",
    icon: SlidersHorizontalIcon,
    id: "settings",
    label: "Settings",
  },
];

export interface DashboardAcceptance {
  isAccepting: boolean;
  isPending?: boolean;
  onToggle: () => void;
}

export interface DashboardProfileLink {
  /** Link without protocol, e.g. "ghostmsg.app/u/maya". */
  label: string;
  onCopy: () => void;
  /** Native share sheet (hidden when not provided). */
  onShare?: () => void;
}

export interface DashboardShellProps {
  acceptance: DashboardAcceptance;
  activeNav: DashboardNavId;
  /** Profile photo (data URL); initials when absent. */
  avatarUrl?: string | null;
  /** The routed page (Inbox, Profile or Settings). */
  children: React.ReactNode;
  onOpenCommand: () => void;
  onSignOut: () => void;
  profileLink: DashboardProfileLink;
  unreadCount: number;
  username: string;
}

type SidebarParts = Omit<DashboardShellProps, "children">;

function UserAvatar({
  username,
  avatarUrl,
  size,
}: {
  avatarUrl?: string | null;
  size: "default" | "lg";
  username: string;
}): React.JSX.Element {
  return (
    <Avatar size={size}>
      {avatarUrl ? <AvatarImage alt="" src={avatarUrl} /> : null}
      <AvatarFallback variant="brand">{username.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}

function AcceptanceField({
  isAccepting,
  isPending = false,
  onToggle,
}: DashboardAcceptance): React.JSX.Element {
  const id = useId();
  const handleToggle = useCallback(() => {
    onToggle();
  }, [onToggle]);

  return (
    <Field className="px-1.5" orientation="horizontal">
      <FieldContent>
        <FieldLabel className="font-bold" htmlFor={id}>
          Message Acceptance
        </FieldLabel>
        <FieldDescription className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn(
              "size-2 rounded-full",
              isAccepting ? "bg-success" : "bg-muted-foreground"
            )}
          />
          {isAccepting ? "Accepting" : "Paused"}
        </FieldDescription>
      </FieldContent>
      <Switch
        checked={isAccepting}
        disabled={isPending}
        id={id}
        onCheckedChange={handleToggle}
        size="xl"
      />
    </Field>
  );
}

/** Sidebar contents; on phones the same Sidebar renders as a Sheet. */
function DashboardSidebar({
  activeNav,
  unreadCount,
  username,
  avatarUrl,
  profileLink,
  acceptance,
  onOpenCommand,
  onSignOut,
}: SidebarParts): React.JSX.Element {
  return (
    <Sidebar aria-label="Sidebar" collapsible="offcanvas">
      <SidebarHeader className="gap-5 px-3.5 pt-5">
        <BrandMark className="px-1.5" href="/" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="rounded-full text-muted-foreground"
              onClick={onOpenCommand}
              size="nav"
              variant="outline"
            >
              <SearchIcon />
              <span className="flex-1 font-normal text-sm">Jump to…</span>
              <Kbd>⌘K</Kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-1.5">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu aria-label="Dashboard">
              {NAV_ITEMS.map(({ id, href, label, icon: Icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeNav === id}
                    size="nav"
                  >
                    <Link
                      aria-current={activeNav === id ? "page" : undefined}
                      href={href}
                    >
                      <Icon />
                      <span>{label}</span>
                      {id === "inbox" && unreadCount > 0 ? (
                        <span className="sr-only"> Unread: {unreadCount}</span>
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                  {id === "inbox" && unreadCount > 0 ? (
                    <SidebarMenuBadge aria-hidden="true" variant="count">
                      {unreadCount}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Item className="bg-card" size="sm" variant="outline">
            <ItemContent className="min-w-0">
              <ItemTitle className="text-muted-foreground text-xs">
                Your Public Profile Link
              </ItemTitle>
              <ItemDescription className="truncate font-semibold text-foreground">
                {profileLink.label}
              </ItemDescription>
            </ItemContent>
            <ItemActions className="w-full">
              <Button
                className="flex-1 rounded-full"
                onClick={profileLink.onCopy}
                size="sm"
              >
                <CopyIcon data-icon="inline-start" />
                Copy
              </Button>
              {profileLink.onShare ? (
                <Button
                  aria-label="Share link"
                  className="rounded-full"
                  onClick={profileLink.onShare}
                  size="icon-sm"
                  variant="outline"
                >
                  <Share2Icon />
                </Button>
              ) : null}
            </ItemActions>
          </Item>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 px-3.5 pb-5">
        <AcceptanceField {...acceptance} />
        <SidebarSeparator className="mx-0" />
        <div className="flex items-center gap-2 px-1.5">
          <UserAvatar
            avatarUrl={avatarUrl}
            size="default"
            username={username}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <b className="truncate text-sm">{username}</b>
            <span className="text-muted-foreground text-xs">Recipient</span>
          </div>
          <PalettePickerButton align="start" size="sm" />
          <ThemeTogglerButton
            modes={["dark", "light"]}
            size="sm"
            variant="ghost"
          />
          <Button
            aria-label="Log out"
            className="text-muted-foreground"
            onClick={onSignOut}
            size="icon-sm"
            variant="ghost"
          >
            <LogOutIcon />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

/** Phone top bar: brand, page title, ⌘K and the avatar that opens the sidebar. */
function MobileTopBar({
  activeNav,
  username,
  avatarUrl,
  onOpenCommand,
}: Pick<
  SidebarParts,
  "activeNav" | "avatarUrl" | "onOpenCommand" | "username"
>): React.JSX.Element {
  const { setOpenMobile } = useSidebar();
  const title =
    NAV_ITEMS.find((item) => item.id === activeNav)?.label ?? "Dashboard";
  const handleOpenMobileSidebar = useCallback(() => {
    setOpenMobile(true);
  }, [setOpenMobile]);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/90 px-4 py-2.5 backdrop-blur md:hidden">
      <BrandMark href="/" iconOnly size="sm" />
      <span className="flex-1 truncate font-bold font-display text-lg">
        {title}
      </span>
      <Button
        aria-label="Open command palette"
        className="size-11 rounded-full"
        onClick={onOpenCommand}
        size="icon"
        variant="ghost"
      >
        <SearchIcon />
      </Button>
      <button
        aria-label="Open menu"
        className="grid size-11 place-items-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        onClick={handleOpenMobileSidebar}
        type="button"
      >
        <UserAvatar avatarUrl={avatarUrl} size="lg" username={username} />
      </button>
    </header>
  );
}

/** Phone bottom tab bar (Inbox / Profile / Settings). */
function MobileTabBar({
  activeNav,
  unreadCount,
}: Pick<SidebarParts, "activeNav" | "unreadCount">): React.JSX.Element {
  return (
    <nav
      aria-label="Dashboard tabs"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map(({ id, href, label, icon: Icon }) => {
        const isActive = activeNav === id;
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 font-semibold text-muted-foreground text-xs",
              isActive && "text-primary"
            )}
            href={href}
            key={id}
          >
            <Icon aria-hidden="true" className="size-6" />
            {label}
            {id === "inbox" && unreadCount > 0 ? (
              <span className="absolute top-1.5 left-[calc(50%+6px)] grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[11px] text-primary-foreground tabular-nums">
                <span className="sr-only">Unread: </span>
                {unreadCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Dashboard frame on the shadcn Sidebar: brand, ⌘K, nav with unread badge,
 * the link card, Message Acceptance and the account row. Phones get a top
 * bar (the avatar opens the same Sidebar as a Sheet) and a bottom tab bar.
 */
export function DashboardShell({
  children,
  ...parts
}: DashboardShellProps): React.JSX.Element {
  return (
    <SidebarProvider data-slot="dashboard-shell">
      <DashboardSidebar {...parts} />
      <SidebarInset className="min-w-0">
        <MobileTopBar
          activeNav={parts.activeNav}
          avatarUrl={parts.avatarUrl}
          onOpenCommand={parts.onOpenCommand}
          username={parts.username}
        />
        {/* SidebarInset is the <main> landmark. */}
        <div className="min-w-0 flex-1 px-4 pt-5 pb-28 sm:px-8 md:pt-6 md:pb-10">
          {children}
        </div>
        <MobileTabBar
          activeNav={parts.activeNav}
          unreadCount={parts.unreadCount}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
