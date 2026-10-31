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
  quarantinedFilterOverride,
  quarantinedInboxArgs,
  searchFilterOverride,
  unreadFilterOverride,
} from "./inbox.mock";

const MESSAGE_CARD_ID_REGEX = /^message-card-/;
const STARRED_REGEX = /starred/i;
const LOAD_MORE_REGEX = /load more/i;

/** Callback spies for every grouped prop, so the Actions panel logs them. */
const spies = () => ({
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
  filters: storyFilters,
  onCopyLink: fn(),
  onRefresh: fn(),
  onViewModeChange: fn(),
  selection: { ...defaultInboxArgs.selection, onClear: fn(), onToggle: fn() },
});

const QUARANTINE_NOTICE_REGEX = /auto-flagged as hurtful or spam/;

/** Spied filter callbacks; empty-state stories spread their override onto these. */
const storyFilters = {
  ...defaultInboxArgs.filters,
  onSearchChange: fn(),
  onStatusChange: fn(),
};

const meta = {
  args: { ...defaultInboxArgs, ...spies() },
  argTypes: {
    bulkActions: { control: "object", description: "Bulk toolbar callbacks" },
    cardActions: { control: false, description: "Per-card callbacks" },
    filters: { control: "object", description: "Status, counts, search" },
    focusedId: { control: "text", description: "j/k cursor message id" },
    isLoading: { control: "boolean", description: "First load skeletons" },
    isRefreshing: {
      control: "boolean",
      description: "Spins the refresh icon and disables it",
    },
    isSenderBlocked: { control: false, description: "senderHash → blocked?" },
    messages: {
      control: "object",
      description: "Messages after filtering/search (page-computed)",
    },
    now: { control: false, description: "Reference time for ages" },
    onCopyLink: { description: "Empty state: copy my link" },
    onRefresh: { description: "Refresh clicked" },
    onViewModeChange: { description: "Grid/List toggle clicked" },
    pagination: {
      control: "object",
      description: "Server paging: Load more when more pages exist",
    },
    revealedIds: { control: "object", description: "Revealed quarantined ids" },
    selection: { control: "object", description: "Selected ids + callbacks" },
    totalMessages: {
      control: "number",
      description: "All messages before filtering (drives the empty state)",
    },
    viewMode: {
      control: "radio",
      description: "Card grid or compact list",
      options: ["grid", "list"],
    },
  },
  component: Inbox,
  tags: ["autodocs"],
  title: "Blocks/Inbox",
} satisfies Meta<typeof Inbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grid: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Inbox" })
    ).toBeVisible();
    await expect(
      canvas.getByText("2 unread · last checked a moment ago")
    ).toBeVisible();
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
    // Skeletons show only after 150 ms (no flash on fast loads).
    await expect(
      await canvas.findByRole("status", { name: "Loading messages" })
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
    await expect(
      canvas.getByText("Share your link to get the first one.")
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Copy link" }));
    await expect(args.onCopyLink).toHaveBeenCalledOnce();
  },
};

export const NoMatches: Story = {
  args: {
    ...noMatchesInboxArgs,
    filters: { ...storyFilters, ...unreadFilterOverride },
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("Nothing unread")).toBeVisible();
    await expect(canvas.getByText("You're all caught up.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filter" }));
    await expect(args.filters.onStatusChange).toHaveBeenCalledWith("all");
    await expect(args.filters.onSearchChange).toHaveBeenCalledWith("");
  },
};

export const SearchNoMatches: Story = {
  args: {
    ...noMatchesInboxArgs,
    filters: { ...storyFilters, ...searchFilterOverride },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No matches for “jacket”")).toBeVisible();
    await expect(
      canvas.getByText("Search looks at message text only.")
    ).toBeVisible();
  },
};

export const NothingQuarantined: Story = {
  args: {
    ...noMatchesInboxArgs,
    filters: { ...storyFilters, ...quarantinedFilterOverride },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Nothing held back")).toBeVisible();
    await expect(
      canvas.getByText("No Quarantined Messages. Nice.")
    ).toBeVisible();
  },
};

export const QuarantinedOnly: Story = {
  args: {
    ...quarantinedInboxArgs,
    filters: { ...defaultInboxArgs.filters, activeStatus: "quarantined" },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Quarantined" })
    ).toBeVisible();
    await expect(canvas.getByText(QUARANTINE_NOTICE_REGEX)).toBeVisible();
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
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
