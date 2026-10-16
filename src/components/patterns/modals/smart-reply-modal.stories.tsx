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

const SAVE_REGEX = /^save answer$/i;
const SAVING_REGEX = /saving/i;
const WITTY_REGEX = /witty/i;

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
  args: {
    ...defaultSmartReplyModalArgs,
    onClose: fn(),
    onGenerate: fn(),
    onPublishedChange: fn(),
    onReplyTextChange: fn(),
    onSave: fn(),
    onSaveAndShare: fn(),
  },
  argTypes: {
    isGenerating: {
      control: "boolean",
      description: "AI draft in progress (“Thinking...”)",
    },
    isOpen: { control: "boolean", description: "Dialog visibility" },
    isPublished: {
      control: "boolean",
      description: "Publish to the public profile showcase",
    },
    isSaving: { control: "boolean", description: "Saving the reply" },
    message: { control: "object", description: "Message being answered" },
    onClose: { description: "Cancel / Escape / overlay" },
    onGenerate: {
      description: "Tone chip clicked → `witty` | `wholesome` | `thoughtful`",
    },
    onPublishedChange: { description: "Publish switch toggled → boolean" },
    onReplyTextChange: { description: "Draft changed → text" },
    onSave: { description: "Save answer clicked" },
    onSaveAndShare: { description: "Answer + Story Card clicked" },
    replyText: {
      control: "text",
      description: `Controlled draft (max ${REPLY_MAX_LENGTH})`,
    },
  },
  component: SmartReplyModal,
  render: (args) => <StatefulSmartReplyModal {...args} />,
  tags: ["autodocs"],
  title: "Patterns/Modals/SmartReplyModal",
} satisfies Meta<typeof SmartReplyModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewReply: Story = {
  play: async ({ args, userEvent }) => {
    await expect(
      await screen.findByRole("dialog", { name: "Answer this message" })
    ).toBeVisible();
    await expect(screen.getByText(sweetMessage.content)).toBeVisible();
    await expect(
      screen.getByRole("button", { name: SAVE_REGEX })
    ).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Your answer"), "Thank you!");
    await expect(args.onReplyTextChange).toHaveBeenLastCalledWith("Thank you!");
    await expect(screen.getByText(`10 / ${REPLY_MAX_LENGTH}`)).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: SAVE_REGEX }));
    await expect(args.onSave).toHaveBeenCalledOnce();
    await userEvent.click(
      screen.getByRole("button", { name: "Answer + Story Card" })
    );
    await expect(args.onSaveAndShare).toHaveBeenCalledOnce();
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
        name: "Show in my Public Q&A",
      })
    );
    await expect(args.onPublishedChange).toHaveBeenCalledWith(false);
  },
};

export const EditingExistingReply: Story = { args: editingSmartReplyModalArgs };

export const Generating: Story = {
  args: { isGenerating: true },
  play: async () => {
    await expect(await screen.findByText("Thinking…")).toBeVisible();
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
