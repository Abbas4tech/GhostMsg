import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor, within } from "storybook/test";
import {
  quarantinedMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { dashboardHandlers } from "./dashboard.mock";
import { DashboardLayout } from "./dashboard-layout";
import { InboxPage } from "./inbox-page";
import { ProfilePage } from "./profile-page";
import { SettingsPage } from "./settings-page";

/** Page stories chain MSW worker start → session → query; allow realistic load time under parallel runs. */
const PAGE_LOAD = { timeout: 15_000 };

const DELETE_REGEX = /^delete$/i;
const REPLY_REGEX = /^reply$/i;
const WITTY_REGEX = /witty/i;
const QUARANTINED_REGEX = /quarantined/i;
const SMART_REPLY_TEXT = "Thanks for the kind words. You just made my day!";

/**
 * The dashboard with real controllers (React Query, next-auth, SSE hook)
 * talking to MSW handlers. No module mocks (ADR 0016, Q4).
 */
const meta = {
  title: "Pages/Dashboard",
  component: DashboardLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    pageProviders: true,
    msw: { handlers: dashboardHandlers.default },
    nextjs: { navigation: { pathname: "/dashboard" } },
  },
  args: { children: null },
  render: () => (
    <DashboardLayout>
      <InboxPage />
    </DashboardLayout>
  ),
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inbox: Story = {
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(sweetMessage.content, undefined, PAGE_LOAD)
    ).toBeVisible();
    await expect(canvas.getByText("2 unread")).toBeVisible();
    const sidebar = canvas.getByRole("complementary", { name: "Sidebar" });
    await expect(within(sidebar).getByText(FIXTURE_USERNAME)).toBeVisible();
    await expect(
      within(sidebar).getByRole("link", { name: "Inbox Unread: 2" })
    ).toHaveAttribute("aria-current", "page");
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
      within(card).getByRole("button", { name: "Delete message" })
    );
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete this message?",
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
      name: "Answer this message",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: WITTY_REGEX })
    );
    await waitFor(() =>
      expect(within(dialog).getByLabelText("Your answer")).toHaveValue(
        SMART_REPLY_TEXT
      )
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Save answer" })
    );
    await expect(
      await screen.findByText("Reply saved successfully!", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const RevealsQuarantined: Story = {
  play: async ({ canvas, userEvent }) => {
    await canvas.findByText(sweetMessage.content, undefined, PAGE_LOAD);
    await userEvent.click(
      canvas.getByRole("radio", { name: QUARANTINED_REGEX })
    );
    await expect(
      await canvas.findByText(
        "Hidden. Flagged as hurtful.",
        undefined,
        PAGE_LOAD
      )
    ).toBeVisible();
    await expect(
      canvas.queryByText(quarantinedMessage.content)
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Reveal" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Reveal this message?",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Reveal once" })
    );
    await expect(
      await canvas.findByText(quarantinedMessage.content)
    ).toBeVisible();
  },
};

export const KeyboardTriage: Story = {
  play: async ({ canvas, userEvent }) => {
    await canvas.findByText(sweetMessage.content, undefined, PAGE_LOAD);
    await userEvent.keyboard("j");
    await waitFor(() =>
      expect(
        canvas.getByTestId(`message-card-${sweetMessage._id}`)
      ).toHaveClass("outline-2")
    );
    await userEvent.keyboard("x");
    await expect(
      canvas.getByRole("toolbar", { name: "Bulk actions" })
    ).toHaveTextContent("1 selected");
    await userEvent.keyboard("/");
    await expect(canvas.getByLabelText("Search messages")).toHaveFocus();
  },
};

export const CommandPalette: Story = {
  play: async ({ canvas, userEvent }) => {
    await canvas.findByText(sweetMessage.content, undefined, PAGE_LOAD);
    await userEvent.keyboard("{Control>}k{/Control}");
    const palette = await screen.findByRole("dialog", {
      name: "Command palette",
    });
    await expect(
      within(palette).getByRole("option", { name: "Settings" })
    ).toBeVisible();
  },
};

export const EmptyInbox: Story = {
  parameters: { msw: { handlers: dashboardHandlers.emptyInbox } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("No Anonymous Messages yet", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const InboxError: Story = {
  parameters: { msw: { handlers: dashboardHandlers.inboxError } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("No Anonymous Messages yet", undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const InboxLoading: Story = {
  parameters: { msw: { handlers: dashboardHandlers.inboxLoading } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("status", { name: "Loading messages" }, PAGE_LOAD)
    ).toBeVisible();
  },
};

export const Settings: Story = {
  parameters: {
    msw: { handlers: dashboardHandlers.closedWithBlocks },
    nextjs: { navigation: { pathname: "/dashboard/settings" } },
  },
  render: () => (
    <DashboardLayout>
      <SettingsPage />
    </DashboardLayout>
  ),
  play: async ({ canvas }) => {
    const main = await canvas.findByRole("main", undefined, PAGE_LOAD);
    await expect(
      await within(main).findByText("3 Sender Hashes", undefined, PAGE_LOAD)
    ).toBeVisible();
    await expect(
      within(main).getByRole("switch", { name: "Message Acceptance" })
    ).not.toBeChecked();
    const sidebar = canvas.getByRole("complementary", { name: "Sidebar" });
    await expect(
      within(sidebar).getByRole("link", { name: "Settings" })
    ).toHaveAttribute("aria-current", "page");
  },
};

export const Profile: Story = {
  parameters: { nextjs: { navigation: { pathname: "/dashboard/profile" } } },
  render: () => (
    <DashboardLayout>
      <ProfilePage />
    </DashboardLayout>
  ),
  play: async ({ canvas }) => {
    const link = await canvas.findByLabelText(
      "Your profile link",
      undefined,
      PAGE_LOAD
    );
    await expect(link).toHaveValue(
      `${window.location.host}/u/${FIXTURE_USERNAME}`
    );
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Profile" })
    ).toBeVisible();
  },
};

export const SessionLoading: Story = {
  parameters: { msw: { handlers: dashboardHandlers.sessionLoading } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("status", { name: "Loading your dashboard" })
    ).toBeVisible();
  },
};

export const SignedOut: Story = {
  parameters: { msw: { handlers: dashboardHandlers.signedOut } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("Sign in to see your inbox", undefined, PAGE_LOAD)
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
