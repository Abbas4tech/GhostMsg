import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { sweetMessage } from "@/mock/fixtures/messages.fixtures";
import { BlockSenderModal } from "./block-sender-modal";
import { defaultBlockSenderModalArgs } from "./modals.mock";

const BLOCK_REGEX = /^block sender$/i;
const UNBLOCK_REGEX = /^unblock sender$/i;
const BLOCKING_REGEX = /blocking/i;

/** Hoisted, single-instance confirm dialog (ADR 0014). Rendered open for review. */
const meta = {
  title: "Patterns/Modals/BlockSenderModal",
  component: BlockSenderModal,
  tags: ["autodocs"],
  args: { ...defaultBlockSenderModalArgs, onClose: fn(), onConfirm: fn() },
  argTypes: {
    open: { control: "boolean", description: "Dialog visibility" },
    message: {
      control: "object",
      description: "Target message; renders nothing without `senderHash`",
    },
    isSenderBlocked: {
      control: "boolean",
      description: "Switches copy + action to “Unblock”",
    },
    isPending: {
      control: "boolean",
      description: "Spinner + disabled confirm",
    },
    onConfirm: { description: "Confirm clicked → (senderHash, isBlocked)" },
    onClose: { description: "Cancel / Escape / overlay" },
  },
} satisfies Meta<typeof BlockSenderModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Block: Story = {
  play: async ({ args, userEvent }) => {
    await expect(
      await screen.findByRole("alertdialog", { name: "Block this sender?" })
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: BLOCK_REGEX }));
    await expect(args.onConfirm).toHaveBeenCalledWith(
      args.message?.senderHash,
      false
    );
  },
};

export const Unblock: Story = {
  args: { isSenderBlocked: true },
  play: async ({ args, userEvent }) => {
    await expect(
      await screen.findByRole("alertdialog", { name: "Unblock this sender?" })
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: UNBLOCK_REGEX }));
    await expect(args.onConfirm).toHaveBeenCalledWith(
      args.message?.senderHash,
      true
    );
  },
};

export const Pending: Story = {
  args: { isPending: true },
  play: async () => {
    await expect(
      await screen.findByRole("button", { name: BLOCKING_REGEX })
    ).toBeDisabled();
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

export const WithoutSenderHash: Story = {
  args: {
    message: { ...sweetMessage, senderHash: undefined },
  },
  play: async () => {
    await expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};
