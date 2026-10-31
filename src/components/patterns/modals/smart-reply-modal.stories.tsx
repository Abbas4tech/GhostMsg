import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useCallback, useState } from "react";
import { expect, fn, screen } from "storybook/test";
import {
  smartReplyDrafts,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
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
const TRY_AGAIN_REGEX = /try again/i;
const [THOUGHTFUL_DRAFT] = smartReplyDrafts;

/** Local state keeps the controlled draft + switch interactive (Storybook UI and tests). */
function StatefulSmartReplyModal(args: SmartReplyModalProps) {
  const [replyText, setReplyText] = useState(args.replyText);
  const [isPublished, setIsPublished] = useState(args.isPublished);
  const handlePublishedChange = useCallback(
    (next: boolean) => {
      args.onPublishedChange(next);
      setIsPublished(next);
    },
    [args]
  );
  const handleReplyTextChange = useCallback(
    (next: string) => {
      args.onReplyTextChange(next);
      setReplyText(next);
    },
    [args]
  );
  return (
    <SmartReplyModal
      {...args}
      isPublished={isPublished}
      onPublishedChange={handlePublishedChange}
      onReplyTextChange={handleReplyTextChange}
      replyText={replyText}
    />
  );
}

const meta = {
  args: {
    ...defaultSmartReplyModalArgs,
    onClose: fn(),
    onPickDraft: fn(),
    onPublishedChange: fn(),
    onReplyTextChange: fn(),
    onRetryDrafts: fn(),
    onSave: fn(),
    onSaveAndShare: fn(),
  },
  argTypes: {
    drafts: {
      control: "object",
      description: "Three Smart Reply drafts `{ text, tone }`, one per tone",
    },
    hasDraftsError: {
      control: "boolean",
      description: "Drafts failed to load (shows “Try again”)",
    },
    isGenerating: {
      control: "boolean",
      description: "Drafts loading: three skeleton rows and “Thinking…”",
    },
    isOpen: { control: "boolean", description: "Dialog visibility" },
    isPublished: {
      control: "boolean",
      description: "Publish to the public profile showcase",
    },
    isSaving: { control: "boolean", description: "Saving the reply" },
    message: { control: "object", description: "Message being answered" },
    onClose: { description: "Cancel / Escape / overlay" },
    onPickDraft: { description: "Smart Reply idea picked → draft text" },
    onPublishedChange: { description: "Publish switch toggled → boolean" },
    onReplyTextChange: { description: "Draft changed → text" },
    onRetryDrafts: { description: "“Try again” after a failed load" },
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

/** Design Modals board: three drafts, one per tone; a pick fills the answer. */
export const PicksSmartReplyIdea: Story = {
  play: async ({ args, userEvent }) => {
    await screen.findByRole("dialog", { name: "Answer this message" });
    const ideas = smartReplyDrafts.map((draft) =>
      screen.getByRole("button", { name: draft.text })
    );
    await expect(ideas).toHaveLength(smartReplyDrafts.length);
    await userEvent.click(
      screen.getByRole("button", { name: THOUGHTFUL_DRAFT?.text })
    );
    await expect(args.onPickDraft).toHaveBeenCalledWith(THOUGHTFUL_DRAFT?.text);
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
  args: { drafts: [], isGenerating: true },
  play: async () => {
    await expect(await screen.findByText("Thinking…")).toBeVisible();
    await expect(
      screen.queryByRole("button", { name: THOUGHTFUL_DRAFT?.text })
    ).not.toBeInTheDocument();
  },
};

export const DraftsFailed: Story = {
  args: { drafts: [], hasDraftsError: true },
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("button", { name: TRY_AGAIN_REGEX })
    );
    await expect(args.onRetryDrafts).toHaveBeenCalledOnce();
  },
};

/** Design MobDrawerReply: "Reply" drawer, ideas scroll sideways, Save + Story Card. */
export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  play: async () => {
    await expect(
      await screen.findByRole("dialog", { name: "Reply" })
    ).toBeVisible();
    await expect(
      screen.getByRole("button", { name: "Story Card" })
    ).toBeVisible();
    await expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
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
