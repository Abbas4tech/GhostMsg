"use client";

import {
  CopyIcon,
  InboxIcon,
  LogOutIcon,
  SearchIcon,
  ShareIcon,
  SlidersHorizontalIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMediaQuery } from "usehooks-ts";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/elements/sidebar";
import { Switch } from "@/components/elements/switch";
import { ThemeTogglerButton } from "@/components/elements/theme-toggler";
import { BrandMark } from "@/components/patterns/brand-mark";
import { MobileHeaderSlotProvider } from "@/components/patterns/mobile-header-actions";
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
/** Tablet widths (768-1023px) start on the icon rail; the full sidebar is for lg+. */
const TABLET_QUERY = "(min-width: 768px) and (max-width: 1023px)";

/**
 * Collapses the sidebar to its icon rail on entering tablet width and opens
 * it again on reaching lg. The rail toggle still works in between.
 */
function useTabletRail(): void {
  const isTablet = useMediaQuery(TABLET_QUERY, { initializeWithValue: false });
  const { setOpen } = useSidebar();
  // Only react to crossing the range, so a manual toggle on desktop sticks.
  const wasTablet = useRef(false);
  useEffect(() => {
    if (isTablet !== wasTablet.current) {
      wasTablet.current = isTablet;
      setOpen(!isTablet);
    }
  }, [isTablet, setOpen]);
}

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
  useTabletRail();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar aria-label="Sidebar" collapsible="icon">
      <SidebarHeader className="gap-5 px-3.5 pt-5 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col-reverse">
          <BrandMark className="px-1.5" href="/" iconOnly={isCollapsed} />
          <SidebarTrigger />
        </div>
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

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
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
                  <ShareIcon />
                </Button>
              ) : null}
            </ItemActions>
          </Item>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 px-3.5 pb-5 group-data-[collapsible=icon]:px-2">
        {/* The icon rail keeps only the avatar; everything else needs the full width. */}
        <div className="contents group-data-[collapsible=icon]:hidden">
          <AcceptanceField {...acceptance} />
          <SidebarSeparator className="mx-0" />
        </div>
        <div className="flex items-center gap-2 px-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <UserAvatar
            avatarUrl={avatarUrl}
            size="default"
            username={username}
          />
          <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
            <b className="truncate text-sm">{username}</b>
            <span className="text-muted-foreground text-xs">Recipient</span>
          </div>
          <div className="contents group-data-[collapsible=icon]:hidden">
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
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

/**
 * Phone top bar (design: 52px, brand tile left). Pages fill the right side
 * with their own actions through `MobileHeaderActions`; the page title is the
 * page's own h1 below, so it isn't repeated here.
 */
function MobileTopBar({
  actionsRef,
  hasLeading,
  leadingRef,
}: {
  actionsRef: (element: HTMLDivElement | null) => void;
  /** A page filled the leading slot (e.g. a back button): hide the brand tile. */
  hasLeading: boolean;
  leadingRef: (element: HTMLDivElement | null) => void;
}): React.JSX.Element {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-13 items-center gap-1 bg-background/90 pt-2 pr-2 backdrop-blur md:hidden",
        hasLeading ? "pl-1" : "pl-4"
      )}
    >
      <div className="contents" ref={leadingRef} />
      {hasLeading ? null : <BrandMark href="/" iconOnly size="header" />}
      <span className="flex-1" />
      <div className="flex items-center gap-1" ref={actionsRef} />
    </header>
  );
}

/** Phone bottom tab bar (design `.bnav`): Inbox / Profile / Settings with a pill behind the active icon. */
function MobileTabBar({
  activeNav,
  unreadCount,
}: Pick<SidebarParts, "activeNav" | "unreadCount">): React.JSX.Element {
  return (
    <nav
      aria-label="Dashboard tabs"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-card/92 px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
    >
      {NAV_ITEMS.map(({ id, href, label, icon: Icon }) => {
        const isActive = activeNav === id;
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className="group/tab relative flex min-h-13 flex-1 flex-col items-center justify-center gap-[3px] rounded-2xl font-semibold text-muted-foreground text-xs aria-[current=page]:text-foreground"
            href={href}
            key={id}
          >
            <span className="grid h-[30px] w-14 place-items-center rounded-full transition-colors duration-(--dur-base) ease-out group-aria-[current=page]/tab:bg-accent group-aria-[current=page]/tab:text-accent-foreground">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            {label}
            {id === "inbox" && unreadCount > 0 ? (
              <span className="absolute top-0.5 left-[calc(50%+8px)] grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-[5px] text-[11px] text-primary-foreground tabular-nums">
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
 * the link card, Message Acceptance and the account row. Phones get the
 * design's top bar (brand tile + page actions via `MobileHeaderActions`) and
 * bottom tab bar; Message Acceptance and Sign out live in Settings there.
 */
export function DashboardShell({
  children,
  ...parts
}: DashboardShellProps): React.JSX.Element {
  const [actionsSlot, setActionsSlot] = useState<HTMLDivElement | null>(null);
  const [leadingSlot, setLeadingSlot] = useState<HTMLDivElement | null>(null);
  const [leadingCount, setLeadingCount] = useState(0);
  const registerLeading = useCallback(() => {
    setLeadingCount((count) => count + 1);
    return () => setLeadingCount((count) => count - 1);
  }, []);
  const slots = useMemo(
    () => ({ actions: actionsSlot, leading: leadingSlot, registerLeading }),
    [actionsSlot, leadingSlot, registerLeading]
  );

  return (
    <MobileHeaderSlotProvider slots={slots}>
      <SidebarProvider data-slot="dashboard-shell">
        <DashboardSidebar {...parts} />
        <SidebarInset className="min-w-0">
          <MobileTopBar
            actionsRef={setActionsSlot}
            hasLeading={leadingCount > 0}
            leadingRef={setLeadingSlot}
          />
          {/* SidebarInset is the <main> landmark. */}
          <div className="min-w-0 flex-1 px-4 pt-1 pb-28 sm:px-8 md:pt-6 md:pb-10">
            {children}
          </div>
          <MobileTabBar
            activeNav={parts.activeNav}
            unreadCount={parts.unreadCount}
          />
        </SidebarInset>
      </SidebarProvider>
    </MobileHeaderSlotProvider>
  );
}
