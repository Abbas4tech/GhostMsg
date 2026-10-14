import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import { sweetMessage } from "@/mock/fixtures/messages.fixtures";
import { Inbox } from "./inbox";
import {
  defaultInboxArgs,
  emptyInboxArgs,
  loadingInboxArgs,
  loadingMoreInboxArgs,
  longContentInboxArgs,
  moreToLoadInboxArgs,
  noMatchesInboxArgs,
  quarantinedInboxArgs,
} from "./inbox.mock";

const MESSAGE_CARD_ID_REGEX = /^message-card-/;
const STARRED_REGEX = /starred/i;
const LOAD_MORE_REGEX = /load more/i;

/** Callback spies for every grouped prop, so the Actions panel logs them. */
const spies = () => ({
  onRefresh: fn(),
  onViewModeChange: fn(),
  onCopyLink: fn(),
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
    onReveal: fn(),
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
    pagination: {
      control: "object",
      description: "Server paging: Load more when more pages exist",
    },
    totalMessages: {
      control: "number",
      description: "All messages before filtering (drives the empty state)",
    },
    viewMode: {
      control: "radio",
      options: ["grid", "list"],
      description: "Card grid or compact list",
    },
    isLoading: { control: "boolean", description: "First load skeletons" },
    isRefreshing: {
      control: "boolean",
      description: "Spins the refresh icon and disables it",
    },
    focusedId: { control: "text", description: "j/k cursor message id" },
    revealedIds: { control: "object", description: "Revealed quarantined ids" },
    filters: { control: "object", description: "Status, counts, search" },
    selection: { control: "object", description: "Selected ids + callbacks" },
    bulkActions: { control: "object", description: "Bulk toolbar callbacks" },
    cardActions: { control: false, description: "Per-card callbacks" },
    isSenderBlocked: { control: false, description: "senderHash → blocked?" },
    now: { control: false, description: "Reference time for ages" },
    onRefresh: { description: "Refresh clicked" },
    onViewModeChange: { description: "Grid/List toggle clicked" },
    onCopyLink: { description: "Empty state: copy my link" },
  },
} satisfies Meta<typeof Inbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grid: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Inbox" })
    ).toBeVisible();
    await expect(canvas.getByText("2 unread")).toBeVisible();
    await expect(canvas.getAllByTestId(MESSAGE_CARD_ID_REGEX)).toHaveLength(
      defaultInboxArgs.messages.length
    );
    await expect(canvas.getByText("Blocked")).toBeVisible();
  },
};

export const EmitsInteractions: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Refresh" }));
    await expect(args.onRefresh).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole("radio", { name: "List view" }));
    await expect(args.onViewModeChange).toHaveBeenCalledWith("list");

    await userEvent.click(canvas.getByRole("radio", { name: STARRED_REGEX }));
    await expect(args.filters.onStatusChange).toHaveBeenCalledWith("starred");

    await userEvent.type(canvas.getByLabelText("Search messages"), "d");
    await expect(args.filters.onSearchChange).toHaveBeenCalledWith("d");

    const firstCard = canvas.getByTestId(`message-card-${sweetMessage._id}`);
    await userEvent.click(
      within(firstCard).getByRole("checkbox", { name: "Select message" })
    );
    await expect(args.selection.onToggle).toHaveBeenCalledWith(
      String(sweetMessage._id)
    );
  },
};

export const ListView: Story = { args: { viewMode: "list" } };

export const Focused: Story = {
  args: { focusedId: String(sweetMessage._id) },
};

export const Loading: Story = {
  args: loadingInboxArgs,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("status", { name: "Loading messages" })
    ).toBeVisible();
  },
};

export const Refreshing: Story = {
  args: { isRefreshing: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Refresh" })
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
    await expect(
      canvas.getByRole("toolbar", { name: "Bulk actions" })
    ).toHaveTextContent("2 selected");
  },
};

export const Empty: Story = {
  args: emptyInboxArgs,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("No Anonymous Messages yet")).toBeVisible();
    await expect(
      canvas.queryByRole("group", { name: "Filter messages" })
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Copy my link" }));
    await expect(args.onCopyLink).toHaveBeenCalledOnce();
  },
};

export const NoMatches: Story = {
  args: noMatchesInboxArgs,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("Nothing here")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filter" }));
    await expect(args.filters.onStatusChange).toHaveBeenCalledWith("all");
    await expect(args.filters.onSearchChange).toHaveBeenCalledWith("");
  },
};

export const QuarantinedOnly: Story = {
  args: {
    ...quarantinedInboxArgs,
    filters: { ...defaultInboxArgs.filters, activeStatus: "quarantined" },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(
        "Quarantined Messages are blurred. Nothing here reaches your main inbox."
      )
    ).toBeVisible();
  },
};

export const LongContent: Story = { args: longContentInboxArgs };

export const MoreToLoad: Story = {
  args: {
    pagination: { ...moreToLoadInboxArgs.pagination, onLoadMore: fn() },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: LOAD_MORE_REGEX })
    );
    await expect(args.pagination?.onLoadMore).toHaveBeenCalledOnce();
  },
};

export const LoadingMore: Story = {
  args: loadingMoreInboxArgs,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: LOAD_MORE_REGEX })
    ).toBeDisabled();
  },
};

export const LastPage: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("button", { name: LOAD_MORE_REGEX })
    ).not.toBeInTheDocument();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
