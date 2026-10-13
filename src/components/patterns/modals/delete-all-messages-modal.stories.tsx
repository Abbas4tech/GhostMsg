import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { DeleteAllMessagesModal } from "./delete-all-messages-modal";
import { defaultDeleteAllMessagesModalArgs } from "./modals.mock";

const meta = {
  title: "Patterns/Modals/DeleteAllMessagesModal",
  component: DeleteAllMessagesModal,
  tags: ["autodocs"],
  args: {
    ...defaultDeleteAllMessagesModalArgs,
    onConfirm: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    open: { control: "boolean", description: "Dialog visibility" },
    total: { control: "number", description: "Messages that will go" },
    onConfirm: { description: "Delete all clicked" },
    onOpenChange: { description: "Keep them / Escape" },
  },
} satisfies Meta<typeof DeleteAllMessagesModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, userEvent }) => {
    await expect(
      await screen.findByRole("alertdialog", {
        name: "Delete all 6 messages?",
      })
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Delete all" }));
    await expect(args.onConfirm).toHaveBeenCalledOnce();
  },
};

export const SingleMessage: Story = {
  args: { total: 1 },
  play: async () => {
    await expect(
      await screen.findByRole("alertdialog", { name: "Delete 1 message?" })
    ).toBeVisible();
  },
};

export const Cancels: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("button", { name: "Keep them" })
    );
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
