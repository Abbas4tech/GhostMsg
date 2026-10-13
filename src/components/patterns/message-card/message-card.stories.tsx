import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import {
  answeredSpicyMessage,
  quarantinedMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { MessageCard } from "./message-card";
import {
  answeredMessageCardArgs,
  blockedSenderMessageCardArgs,
  defaultMessageCardArgs,
  listMessageCardArgs,
  longContentMessageCardArgs,
  noSenderHashMessageCardArgs,
  privateReplyMessageCardArgs,
  quarantinedMessageCardArgs,
  revealedQuarantinedMessageCardArgs,
} from "./message-card.mock";

const REPLY_REGEX = /^reply$/i;
const DELETE_REGEX = /delete message/i;

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
    onReveal: fn(),
  },
  argTypes: {
    message: {
      control: "object",
      description: "Inbox message (`MessageItem` from the API)",
    },
    layout: {
      control: "radio",
      options: ["grid", "list"],
      description: "Card or compact list row",
    },
    isSelected: { control: "boolean", description: "Bulk-selection state" },
    isFocused: { control: "boolean", description: "j/k keyboard cursor" },
    isRevealed: {
      control: "boolean",
      description: "Quarantined body revealed by the recipient",
    },
    isSenderBlocked: {
      control: "boolean",
      description: "Shows Blocked and an Unblock action",
    },
    now: { control: "date", description: "Reference time for the age" },
    onToggleSelect: { description: "Checkbox clicked → message id" },
    onStarToggle: { description: "Star clicked → message" },
    onOpenReply: { description: "Reply / Edit answer clicked → message" },
    onOpenStoryCard: { description: "Share as Story Card → message" },
    onOpenBlock: { description: "Block / Unblock → message (needs a hash)" },
    onOpenDelete: { description: "Delete clicked → message" },
    onReveal: { description: "Reveal a quarantined message → message" },
  },
} satisfies Meta<typeof MessageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText(sweetMessage.content)).toBeVisible();
    await expect(canvas.getByText("Sweet")).toBeVisible();
    await expect(canvas.getByText("2m")).toBeVisible();
    await expect(
      canvasElement.querySelector('[data-state="unread"]')
    ).not.toBeNull();
  },
};

export const EmitsEveryAction: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select message" })
    );
    await expect(args.onToggleSelect).toHaveBeenCalledWith(
      String(sweetMessage._id)
    );

    await userEvent.click(canvas.getByRole("button", { name: "Star message" }));
    await expect(args.onStarToggle).toHaveBeenCalledWith(sweetMessage);

    await userEvent.click(canvas.getByRole("button", { name: REPLY_REGEX }));
    await expect(args.onOpenReply).toHaveBeenCalledWith(sweetMessage);

    await userEvent.click(
      canvas.getByRole("button", { name: "Share as Story Card" })
    );
    await expect(args.onOpenStoryCard).toHaveBeenCalledWith(sweetMessage);

    await userEvent.click(canvas.getByRole("button", { name: "Block sender" }));
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
      canvas.getByRole("checkbox", { name: "Select message" })
    ).toBeChecked();
  },
};

export const Focused: Story = { args: { isFocused: true } };

export const AnsweredPublic: Story = {
  args: answeredMessageCardArgs,
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(answeredSpicyMessage.reply?.text ?? "")
    ).toBeVisible();
    await expect(canvas.getByText("Public")).toBeVisible();
    await expect(canvas.getByText("Answered")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Edit answer" })
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Unstar message" })
    ).toHaveAttribute("aria-pressed", "true");
  },
};

export const AnsweredPrivately: Story = {
  args: privateReplyMessageCardArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Answered")).toBeVisible();
    await expect(canvas.queryByText("Public")).not.toBeInTheDocument();
  },
};

export const Quarantined: Story = {
  args: quarantinedMessageCardArgs,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("Quarantined")).toBeVisible();
    await expect(canvas.getByText("Hidden. Flagged as hurtful.")).toBeVisible();
    await expect(
      canvas.queryByText(quarantinedMessage.content)
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "Share as Story Card" })
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Reveal" }));
    await expect(args.onReveal).toHaveBeenCalledWith(quarantinedMessage);
  },
};

export const QuarantinedRevealed: Story = {
  args: revealedQuarantinedMessageCardArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(quarantinedMessage.content)).toBeVisible();
  },
};

export const BlockedSender: Story = {
  args: blockedSenderMessageCardArgs,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("Blocked")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Unblock sender" })
    );
    await expect(args.onOpenBlock).toHaveBeenCalled();
  },
};

export const WithoutSenderHash: Story = {
  args: noSenderHashMessageCardArgs,
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("button", { name: "Block sender" })
    ).not.toBeInTheDocument();
  },
};

export const ListRow: Story = {
  args: listMessageCardArgs,
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Reply" }));
    await expect(args.onOpenReply).toHaveBeenCalledWith(sweetMessage);
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
