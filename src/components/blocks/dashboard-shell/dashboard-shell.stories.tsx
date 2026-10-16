import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, within } from "storybook/test";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { DashboardShell } from "./dashboard-shell";
import {
  dashboardShellSlotText,
  defaultDashboardShellArgs,
  pausedDashboardShellArgs,
} from "./dashboard-shell.mock";

const meta = {
  title: "Blocks/DashboardShell",
  component: DashboardShell,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    ...defaultDashboardShellArgs,
    profileLink: {
      ...defaultDashboardShellArgs.profileLink,
      onCopy: fn(),
      onShare: fn(),
    },
    acceptance: { ...defaultDashboardShellArgs.acceptance, onToggle: fn() },
    onOpenCommand: fn(),
    onSignOut: fn(),
    children: (
      <div className="rounded-xl border p-6">{dashboardShellSlotText}</div>
    ),
  },
  argTypes: {
    activeNav: {
      control: "radio",
      options: ["inbox", "profile", "settings"],
      description: "Current route",
    },
    unreadCount: { control: "number", description: "Inbox badge" },
    username: { control: "text", description: "Account row" },
    profileLink: { control: "object", description: "Link card" },
    acceptance: { control: "object", description: "Message Acceptance" },
    children: { control: false, description: "Routed page" },
    onOpenCommand: { description: "Jump to… / ⌘K" },
    onSignOut: { description: "Log out clicked" },
  },
} satisfies Meta<typeof DashboardShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const sidebar = canvas.getByRole("complementary", { name: "Sidebar" });
    await expect(
      within(sidebar).getByRole("link", { name: "Inbox Unread: 3" })
    ).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByText(dashboardShellSlotText)).toBeVisible();
    await expect(within(sidebar).getByText(FIXTURE_USERNAME)).toBeVisible();

    await userEvent.click(
      within(sidebar).getByRole("button", { name: "Copy" })
    );
    await expect(args.profileLink.onCopy).toHaveBeenCalledOnce();

    await userEvent.click(
      within(sidebar).getByRole("switch", { name: "Message Acceptance" })
    );
    await expect(args.acceptance.onToggle).toHaveBeenCalledOnce();

    await userEvent.click(
      within(sidebar).getByRole("button", { name: "Jump to… ⌘K" })
    );
    await expect(args.onOpenCommand).toHaveBeenCalledOnce();
  },
};

export const SettingsActive: Story = {
  args: { activeNav: "settings" },
  play: async ({ canvas }) => {
    const sidebar = canvas.getByRole("complementary", { name: "Sidebar" });
    await expect(
      within(sidebar).getByRole("link", { name: "Settings" })
    ).toHaveAttribute("aria-current", "page");
  },
};

export const Paused: Story = {
  args: pausedDashboardShellArgs,
  play: async ({ canvas }) => {
    const sidebar = canvas.getByRole("complementary", { name: "Sidebar" });
    await expect(within(sidebar).getByText("Paused")).toBeVisible();
    await expect(
      within(sidebar).getByRole("switch", { name: "Message Acceptance" })
    ).not.toBeChecked();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
