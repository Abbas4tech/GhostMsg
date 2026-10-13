import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { DeleteMessageModal } from "./delete-message-modal";
import { defaultDeleteMessageModalArgs } from "./modals.mock";

const DELETE_REGEX = /^delete$/i;
const DELETING_REGEX = /deleting/i;

const meta = {
  title: "Patterns/Modals/DeleteMessageModal",
  component: DeleteMessageModal,
  tags: ["autodocs"],
  args: { ...defaultDeleteMessageModalArgs, onClose: fn(), onConfirm: fn() },
  argTypes: {
    open: { control: "boolean", description: "Dialog visibility" },
    message: {
      control: "object",
      description: "Message to delete; renders nothing when null",
    },
    isPending: { control: "boolean", description: "Shows “Deleting...”" },
    onConfirm: { description: "Delete clicked → message" },
    onClose: { description: "Cancel / Escape / overlay" },
  },
} satisfies Meta<typeof DeleteMessageModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, userEvent }) => {
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete Message?",
    });
    await expect(dialog).toHaveAccessibleDescription(
      "This message will be permanently deleted from your inbox."
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
    await expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  },
};

export const Cancels: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("button", { name: "Cancel" })
    );
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const NoMessage: Story = {
  args: { message: null },
  play: async () => {
    await expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};
