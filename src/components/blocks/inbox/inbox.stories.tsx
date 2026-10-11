import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { sweetMessage } from "@/mock/fixtures/messages.fixtures";
import { Inbox } from "./inbox";
import {
  defaultInboxArgs,
  emptyInboxArgs,
  longContentInboxArgs,
  noMatchesInboxArgs,
  quarantinedInboxArgs,
} from "./inbox.mock";

const REFRESH_REGEX = /refresh/i;
const MESSAGE_CARD_ID_REGEX = /^message-card-/;
const STARRED_REGEX = /starred/i;

/** Callback spies for every grouped prop, so the Actions panel logs them. */
const spies = () => ({
  onRefresh: fn(),
  onViewModeChange: fn(),
  filters: {
    ...defaultInboxArgs.filters,
    onSearchChange: fn(),
    onStatusChange: fn(),
  },
  selection: { ...defaultInboxArgs.selection, onToggle: fn(), onClear: fn() },
  bulkActions: {
    ...defaultInboxArgs.bulkActions,
    onAction: fn(),
    onExport: fn(),
  },
  cardActions: {
    onOpenBlock: fn(),
    onOpenDelete: fn(),
    onOpenReply: fn(),
    onOpenStoryCard: fn(),
    onStarToggle: fn(),
  },
});

const meta = {
  title: "Blocks/Inbox",
  component: Inbox,
  tags: ["autodocs"],
  args: { ...defaultInboxArgs, ...spies() },
  argTypes: {
    messages: {
      control: "object",
      description: "Messages after filtering/search (page-computed)",
    },
    totalMessages: {
      control: "number",
      description:
        "All messages before filtering — drives header copy + empty state",
    },
    viewMode: {
      control: "radio",
      options: ["grid", "list"],
      description: "Grid (2 cols) or list",
    },
    isRefreshing: {
      control: "boolean",
      description: "Spins the refresh icon and disables it",
    },
    filters: {
      control: "object",
      description: "FilterBar props (status, counts, search + callbacks)",
    },
    selection: {
      control: "object",
      description: "Selected ids + toggle/clear callbacks",
    },
    bulkActions: {
      control: "object",
      description: "Bulk toolbar state + callbacks",
    },
    cardActions: {
      control: false,
      description: "Per-card callbacks (open modals, star)",
    },
    isSenderBlocked: { control: false, description: "senderHash → blocked?" },
    onRefresh: { description: "Refresh clicked" },
    onViewModeChange: { description: "Grid/List toggle clicked" },
  },
} satisfies Meta<typeof Inbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grid: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Your Messages")).toBeVisible();
    await expect(
      canvas.getByText(
        `You have ${defaultInboxArgs.totalMessages} total messages`
      )
    ).toBeVisible();
    await expect(canvas.getAllByTestId(MESSAGE_CARD_ID_REGEX)).toHaveLength(
      defaultInboxArgs.messages.length
    );
    await expect(canvas.getByText("🚫 Blocked Sender")).toBeVisible();
  },
};

export const EmitsInteractions: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: REFRESH_REGEX }));
    await expect(args.onRefresh).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole("button", { name: "List view" }));
    await expect(args.onViewModeChange).toHaveBeenCalledWith("list");

    await userEvent.click(canvas.getByRole("button", { name: STARRED_REGEX }));
    await expect(args.filters.onStatusChange).toHaveBeenCalledWith("starred");

    const firstCard = canvas.getByTestId(`message-card-${sweetMessage._id}`);
    await userEvent.click(
      firstCard.querySelector(
        'button[aria-label="Select message"]'
      ) as HTMLElement
    );
    await expect(args.selection.onToggle).toHaveBeenCalledWith(
      String(sweetMessage._id)
    );
  },
};

export const ListView: Story = { args: { viewMode: "list" } };

export const Refreshing: Story = {
  args: { isRefreshing: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: REFRESH_REGEX })
    ).toBeDisabled();
  },
};

export const WithSelection: Story = {
  args: {
    selection: {
      ...defaultInboxArgs.selection,
      selectedIds: [String(sweetMessage._id), "msg-2"],
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("2 selected")).toBeVisible();
  },
};

export const Empty: Story = {
  args: emptyInboxArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No messages yet")).toBeVisible();
    await expect(
      canvas.queryByPlaceholderText("Search messages...")
    ).not.toBeInTheDocument();
  },
};

export const NoMatches: Story = {
  args: noMatchesInboxArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No matching messages found")).toBeVisible();
    await expect(
      canvas.getByPlaceholderText("Search messages...")
    ).toBeVisible();
  },
};

export const QuarantinedOnly: Story = {
  args: {
    ...quarantinedInboxArgs,
    filters: { ...defaultInboxArgs.filters, activeStatus: "quarantined" },
  },
};

export const LongContent: Story = { args: longContentInboxArgs };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
