import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { answeredSpicyMessage } from "@/mock/fixtures/messages.fixtures";
import { DeleteMessageModal } from "./delete-message-modal";
import { defaultDeleteMessageModalArgs } from "./modals.mock";

const DELETE_REGEX = /^delete$/i;
const DELETING_REGEX = /deleting/i;

const meta = {
  args: { ...defaultDeleteMessageModalArgs, onClose: fn(), onConfirm: fn() },
  argTypes: {
    isPending: { control: "boolean", description: "Shows “Deleting...”" },
    message: {
      control: "object",
      description: "Message to delete; renders nothing when null",
    },
    onClose: { description: "Cancel / Escape / overlay" },
    onConfirm: { description: "Delete clicked → message" },
    open: { control: "boolean", description: "Dialog visibility" },
  },
  component: DeleteMessageModal,
  tags: ["autodocs"],
  title: "Patterns/Modals/DeleteMessageModal",
} satisfies Meta<typeof DeleteMessageModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, userEvent }) => {
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete this message?",
    });
    await expect(dialog).toHaveAccessibleDescription(
      "It will be removed from your inbox for good. This can't be undone."
    );
    await userEvent.click(screen.getByRole("button", { name: DELETE_REGEX }));
    await expect(args.onConfirm).toHaveBeenCalledWith(args.message);
  },
};

export const Pending: Story = {
  args: { isPending: true },
  play: async () => {
    await expect(
      await screen.findByRole("button", { name: DELETING_REGEX })
    ).toBeDisabled();
    await expect(
      screen.getByRole("button", { name: "Keep it" })
    ).toBeDisabled();
  },
};

export const Cancels: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("button", { name: "Keep it" })
    );
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const PublicAnswer: Story = {
  args: { message: answeredSpicyMessage },
  play: async () => {
    await expect(
      await screen.findByRole("alertdialog", { name: "Delete this message?" })
    ).toHaveAccessibleDescription(
      "It has a public answer on your profile, so that answer goes too. This can't be undone."
    );
  },
};

export const NoMessage: Story = {
  args: { message: null },
  play: async () => {
    await expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};
