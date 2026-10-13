import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor, within } from "storybook/test";
import {
  answeredSpicyMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { DashboardPage } from "./dashboard-page";
import { dashboardHandlers } from "./dashboard-page.mock";

/** Page stories chain MSW worker start → session → lazy chunk → query; allow realistic load time under parallel runs. */
const PAGE_LOAD = { timeout: 15_000 };

const SETTINGS_TAB_REGEX = /settings/i;
const PROFILE_TAB_REGEX = /profile/i;
const DELETE_MESSAGE_REGEX = /delete message/i;
const DELETE_REGEX = /^delete$/i;
const REPLY_REGEX = /^reply$/i;
const WITTY_REGEX = /witty roast/i;
const SAVE_REPLY_REGEX = /save reply/i;
const QUARANTINED_REGEX = /quarantined/i;
const SMART_REPLY_TEXT = "Thanks for the kind words. You just made my day!";

/**
 * Full page with real controllers (React Query, next-auth, SSE hook) talking to
 * MSW handlers — no module mocks (ADR 0016, Q4).
 */
const meta = {
  title: "Pages/Dashboard",
  component: DashboardPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    pageProviders: true,
    msw: { handlers: dashboardHandlers.default },
  },
  // Tabs are code-split with next/dynamic; preload their modules so the first
  // story doesn't race Vite's on-demand transform of the lazy chunks.
  loaders: [
    async () => {
      await Promise.all([
        import("./inbox-tab"),
        import("./profile-tab"),
        import("./settings-tab"),
      ]);
      return {};
    },
  ],
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inbox: Story = {
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(sweetMessage.content, undefined, PAGE_LOAD)
    ).toBeVisible();
    await expect(
      canvas.getByText(
        `Welcome back, ${FIXTURE_USERNAME}! Manage your messages and profile settings.`
      )
    ).toBeVisible();
    await expect(canvas.getByText("You have 6 total messages")).toBeVisible();
  },
};

export const DeletesAMessage: Story = {
  play: async ({ canvas, userEvent }) => {
    const card = await canvas.findByTestId(
      `message-card-${sweetMessage._id}`,
      undefined,
      PAGE_LOAD
    );
    await userEvent.click(
      within(card).getByRole("button", { name: DELETE_MESSAGE_REGEX })
    );
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete Message?",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: DELETE_REGEX })
    );
    await expect(
      await screen.findByText("Message deleted", undefined, PAGE_LOAD)
    ).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    );
  },
};

export const RepliesWithAi: Story = {
  play: async ({ canvas, userEvent }) => {
    const card = await canvas.findByTestId(
      `message-card-${sweetMessage._id}`,
      undefined,
      PAGE_LOAD
    );
    await userEvent.click(
      within(card).getByRole("button", { name: REPLY_REGEX })
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Reply & Public Q&A",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: WITTY_REGEX })
    );
    await waitFor(() =>
      expect(
        within(dialog).getByPlaceholderText("Type your reply here...")
      ).toHaveValue(SMART_REPLY_TEXT)
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: SAVE_REPLY_REGEX })
    );
    await expect(
      await screen.findByText("Reply saved successfully!", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const FiltersQuarantined: Story = {
  play: async ({ canvas, userEvent }) => {
    await canvas.findByText(sweetMessage.content, undefined, PAGE_LOAD);
    await userEvent.click(
      canvas.getByRole("button", { name: QUARANTINED_REGEX })
    );
    await expect(
      await canvas.findByText("🛡️ Quarantined", undefined, PAGE_LOAD)
    ).toBeVisible();
    await expect(
      canvas.queryByText(answeredSpicyMessage.content)
    ).not.toBeInTheDocument();
  },
};

export const EmptyInbox: Story = {
  parameters: { msw: { handlers: dashboardHandlers.emptyInbox } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("No messages yet", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const InboxError: Story = {
  parameters: { msw: { handlers: dashboardHandlers.inboxError } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("No messages yet", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const InboxLoading: Story = {
  parameters: { msw: { handlers: dashboardHandlers.inboxLoading } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("Your Messages", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const SettingsTab: Story = {
  parameters: { msw: { handlers: dashboardHandlers.closedWithBlocks } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("tab", { name: SETTINGS_TAB_REGEX }, PAGE_LOAD)
    );
    await expect(
      await canvas.findByText("3 blocked senders", undefined, PAGE_LOAD)
    ).toBeVisible();
    await expect(
      canvas.getByRole("switch", { name: "Accept Messages" })
    ).not.toBeChecked();
  },
};

export const ProfileTab: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("tab", { name: PROFILE_TAB_REGEX }, PAGE_LOAD)
    );
    const link = await canvas.findByLabelText(
      "Your profile link",
      undefined,
      PAGE_LOAD
    );
    await expect(link).toHaveValue(
      `${window.location.origin}/u/${FIXTURE_USERNAME}`
    );
  },
};

export const SessionLoading: Story = {
  parameters: { msw: { handlers: dashboardHandlers.sessionLoading } },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
  },
};

export const SignedOut: Story = {
  parameters: { msw: { handlers: dashboardHandlers.signedOut } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("Access Denied", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(sweetMessage.content, undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};
