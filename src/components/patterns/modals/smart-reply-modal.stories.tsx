import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, screen } from "storybook/test";
import { sweetMessage } from "@/mock/fixtures/messages.fixtures";
import {
  defaultSmartReplyModalArgs,
  editingSmartReplyModalArgs,
} from "./modals.mock";
import {
  REPLY_MAX_LENGTH,
  SmartReplyModal,
  type SmartReplyModalProps,
} from "./smart-reply-modal";

const SAVE_REGEX = /save reply/i;
const SAVING_REGEX = /saving/i;
const WITTY_REGEX = /witty roast/i;

/** Local state keeps the controlled draft + switch interactive (Storybook UI and tests). */
function StatefulSmartReplyModal(args: SmartReplyModalProps) {
  const [replyText, setReplyText] = useState(args.replyText);
  const [isPublished, setIsPublished] = useState(args.isPublished);
  return (
    <SmartReplyModal
      {...args}
      isPublished={isPublished}
      onPublishedChange={(next) => {
        args.onPublishedChange(next);
        setIsPublished(next);
      }}
      onReplyTextChange={(next) => {
        args.onReplyTextChange(next);
        setReplyText(next);
      }}
      replyText={replyText}
    />
  );
}

const meta = {
  title: "Patterns/Modals/SmartReplyModal",
  component: SmartReplyModal,
  tags: ["autodocs"],
  args: {
    ...defaultSmartReplyModalArgs,
    onClose: fn(),
    onGenerate: fn(),
    onPublishedChange: fn(),
    onReplyTextChange: fn(),
    onSave: fn(),
  },
  argTypes: {
    isOpen: { control: "boolean", description: "Dialog visibility" },
    message: { control: "object", description: "Message being answered" },
    replyText: {
      control: "text",
      description: `Controlled draft (max ${REPLY_MAX_LENGTH})`,
    },
    isPublished: {
      control: "boolean",
      description: "Publish to the public profile showcase",
    },
    isGenerating: {
      control: "boolean",
      description: "AI draft in progress (“Thinking...”)",
    },
    isSaving: { control: "boolean", description: "Saving the reply" },
    onGenerate: {
      description: "Tone chip clicked → `witty` | `wholesome` | `thoughtful`",
    },
    onReplyTextChange: { description: "Draft changed → text" },
    onPublishedChange: { description: "Publish switch toggled → boolean" },
    onSave: { description: "Save Reply clicked" },
    onClose: { description: "Cancel / Escape / overlay" },
  },
  render: (args) => <StatefulSmartReplyModal {...args} />,
} satisfies Meta<typeof SmartReplyModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewReply: Story = {
  play: async ({ args, userEvent }) => {
    await expect(
      await screen.findByRole("dialog", { name: "Reply & Public Q&A" })
    ).toBeVisible();
    await expect(screen.getByText(`“${sweetMessage.content}”`)).toBeVisible();
    await expect(
      screen.getByRole("button", { name: SAVE_REGEX })
    ).toBeDisabled();

    await userEvent.type(
      screen.getByPlaceholderText("Type your reply here..."),
      "Thank you!"
    );
    await expect(args.onReplyTextChange).toHaveBeenLastCalledWith("Thank you!");
    await expect(screen.getByText(`10 / ${REPLY_MAX_LENGTH}`)).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: SAVE_REGEX }));
    await expect(args.onSave).toHaveBeenCalledOnce();
  },
};

export const GeneratesWithAi: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("button", { name: WITTY_REGEX })
    );
    await expect(args.onGenerate).toHaveBeenCalledWith("witty");
  },
};

export const TogglesPublish: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("switch", {
        name: "Publish to Public Profile Showcase",
      })
    );
    await expect(args.onPublishedChange).toHaveBeenCalledWith(false);
  },
};

export const EditingExistingReply: Story = { args: editingSmartReplyModalArgs };

export const Generating: Story = {
  args: { isGenerating: true },
  play: async () => {
    await expect(await screen.findByText("Thinking...")).toBeVisible();
    await expect(
      screen.getByRole("button", { name: WITTY_REGEX })
    ).toBeDisabled();
  },
};

export const Saving: Story = {
  args: { ...editingSmartReplyModalArgs, isSaving: true },
  play: async () => {
    await expect(
      await screen.findByRole("button", { name: SAVING_REGEX })
    ).toBeDisabled();
  },
};

export const Private: Story = {
  args: { ...editingSmartReplyModalArgs, isPublished: false },
};
