import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { DashboardShell } from "./dashboard-shell";
import {
  dashboardShellSlotText,
  defaultDashboardShellArgs,
} from "./dashboard-shell.mock";

const SETTINGS_TAB_REGEX = /settings/i;
const PROFILE_TAB_REGEX = /profile/i;

const meta = {
  title: "Blocks/DashboardShell",
  component: DashboardShell,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    ...defaultDashboardShellArgs,
    messages: (
      <div className="rounded-xl border p-6">
        {dashboardShellSlotText.messages}
      </div>
    ),
    profile: (
      <div className="rounded-xl border p-6">
        {dashboardShellSlotText.profile}
      </div>
    ),
    settings: (
      <div className="rounded-xl border p-6">
        {dashboardShellSlotText.settings}
      </div>
    ),
  },
  argTypes: {
    username: { control: "text", description: "Shown in the welcome line" },
    defaultTab: {
      control: "radio",
      options: ["messages", "profile", "settings"],
      description: "Initially open tab",
    },
    messages: {
      control: false,
      description: "Messages tab slot (InboxTab in the app)",
    },
    profile: { control: false, description: "Profile tab slot" },
    settings: { control: false, description: "Settings tab slot" },
  },
} satisfies Meta<typeof DashboardShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Messages: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(
        `Welcome back, ${FIXTURE_USERNAME}! Manage your messages and profile settings.`
      )
    ).toBeVisible();
    await expect(
      canvas.getByText(dashboardShellSlotText.messages)
    ).toBeVisible();
  },
};

export const SwitchesTabs: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("tab", { name: SETTINGS_TAB_REGEX })
    );
    await expect(
      canvas.getByRole("tab", { name: SETTINGS_TAB_REGEX })
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      await canvas.findByText(dashboardShellSlotText.settings)
    ).toBeVisible();
    // Inactive tab panels are unmounted, so their controllers/queries don't run.
    await expect(
      canvas.queryByText(dashboardShellSlotText.messages)
    ).not.toBeInTheDocument();
  },
};

export const ProfileTabOpen: Story = {
  args: { defaultTab: "profile" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("tab", { name: PROFILE_TAB_REGEX })
    ).toHaveAttribute("aria-selected", "true");
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
