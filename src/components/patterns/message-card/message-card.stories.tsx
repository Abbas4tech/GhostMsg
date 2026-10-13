import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { sweetMessage } from "@/mock/fixtures/messages.fixtures";
import { MessageCard } from "./message-card";
import {
  answeredMessageCardArgs,
  blockedSenderMessageCardArgs,
  defaultMessageCardArgs,
  longContentMessageCardArgs,
  noSenderHashMessageCardArgs,
  privateReplyMessageCardArgs,
  quarantinedMessageCardArgs,
} from "./message-card.mock";

const STAR_REGEX = /^star message$/i;
const REPLY_REGEX = /^reply$/i;
const EDIT_REPLY_REGEX = /edit reply/i;
const STORY_CARD_REGEX = /story card/i;
const BLOCK_REGEX = /^block sender$/i;
const UNBLOCK_REGEX = /unblock sender/i;
const DELETE_REGEX = /delete message/i;
const SELECT_REGEX = /^select message$/i;

const meta = {
  title: "Patterns/MessageCard",
  component: MessageCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    ...defaultMessageCardArgs,
    onToggleSelect: fn(),
    onStarToggle: fn(),
    onOpenReply: fn(),
    onOpenStoryCard: fn(),
    onOpenBlock: fn(),
    onOpenDelete: fn(),
  },
  argTypes: {
    message: {
      control: "object",
      description: "Inbox message (`MessageItem` from the API)",
    },
    isSelected: {
      control: "boolean",
      description: "Bulk-selection state (purple ring)",
    },
    isSenderBlocked: {
      control: "boolean",
      description: "Shows the blocked badge and an unblock action",
    },
    variant: {
      control: "select",
      options: ["default", "glass", "ghost", "bordered"],
      description: "Card surface",
    },
    onToggleSelect: { description: "Checkbox clicked → message id" },
    onStarToggle: { description: "Star clicked → message" },
    onOpenReply: { description: "Reply / Edit Reply clicked → message" },
    onOpenStoryCard: { description: "Story Card clicked → message" },
    onOpenBlock: {
      description:
        "Block/unblock clicked → message (only when it has a sender hash)",
    },
    onOpenDelete: { description: "Delete clicked → message" },
  },
} satisfies Meta<typeof MessageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText(sweetMessage.content)).toBeVisible();
    await expect(canvas.getByText("Sweet")).toBeVisible();
    await expect(canvas.queryByText("💬 Your Reply:")).not.toBeInTheDocument();
  },
};

export const EmitsEveryAction: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: SELECT_REGEX }));
    await expect(args.onToggleSelect).toHaveBeenCalledWith(
      String(sweetMessage._id)
    );

    await userEvent.click(canvas.getByRole("button", { name: STAR_REGEX }));
    await expect(args.onStarToggle).toHaveBeenCalledWith(sweetMessage);

    await userEvent.click(canvas.getByRole("button", { name: REPLY_REGEX }));
    await expect(args.onOpenReply).toHaveBeenCalledWith(sweetMessage);

    await userEvent.click(
      canvas.getByRole("button", { name: STORY_CARD_REGEX })
    );
    await expect(args.onOpenStoryCard).toHaveBeenCalledWith(sweetMessage);

    await userEvent.click(canvas.getByRole("button", { name: BLOCK_REGEX }));
    await expect(args.onOpenBlock).toHaveBeenCalledWith(sweetMessage);

    await userEvent.click(canvas.getByRole("button", { name: DELETE_REGEX }));
    await expect(args.onOpenDelete).toHaveBeenCalledWith(sweetMessage);

    // Pure pattern: no dialog is mounted inside the card.
    await expect(canvas.queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};

export const Selected: Story = {
  args: { isSelected: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Deselect message" })
    ).toHaveAttribute("aria-pressed", "true");
  },
};

export const AnsweredPublic: Story = {
  args: answeredMessageCardArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("💬 Your Reply:")).toBeVisible();
    await expect(canvas.getByText("Public")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: EDIT_REPLY_REGEX })
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Unstar message" })
    ).toBeVisible();
  },
};

export const AnsweredPrivately: Story = {
  args: privateReplyMessageCardArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("💬 Your Reply:")).toBeVisible();
    await expect(canvas.queryByText("Public")).not.toBeInTheDocument();
  },
};

export const Quarantined: Story = {
  args: quarantinedMessageCardArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("🛡️ Quarantined")).toBeVisible();
  },
};

export const BlockedSender: Story = {
  args: blockedSenderMessageCardArgs,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("🚫 Blocked Sender")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: UNBLOCK_REGEX }));
    await expect(args.onOpenBlock).toHaveBeenCalled();
  },
};

export const WithoutSenderHash: Story = {
  args: noSenderHashMessageCardArgs,
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("button", { name: BLOCK_REGEX })
    ).not.toBeInTheDocument();
  },
};

export const ReadOnly: Story = {
  args: {
    onToggleSelect: undefined,
    onOpenReply: undefined,
    onOpenStoryCard: undefined,
    onOpenBlock: undefined,
    onOpenDelete: undefined,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("button", { name: REPLY_REGEX })
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: DELETE_REGEX })
    ).not.toBeInTheDocument();
  },
};

export const LongContent: Story = { args: longContentMessageCardArgs };

export const Mobile: Story = {
  args: answeredMessageCardArgs,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
