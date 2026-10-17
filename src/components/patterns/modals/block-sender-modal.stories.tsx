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
  args: { ...defaultBlockSenderModalArgs, onClose: fn(), onConfirm: fn() },
  argTypes: {
    isPending: {
      control: "boolean",
      description: "Spinner + disabled confirm",
    },
    isSenderBlocked: {
      control: "boolean",
      description: "Switches copy + action to “Unblock”",
    },
    message: {
      control: "object",
      description: "Target message; renders nothing without `senderHash`",
    },
    onClose: { description: "Cancel / Escape / overlay" },
    onConfirm: {
      description: "Confirm clicked → (senderHash, isBlocked, alsoDelete)",
    },
    open: { control: "boolean", description: "Dialog visibility" },
  },
  component: BlockSenderModal,
  tags: ["autodocs"],
  title: "Patterns/Modals/BlockSenderModal",
} satisfies Meta<typeof BlockSenderModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Block: Story = {
  play: async ({ args, userEvent }) => {
    await expect(
      await screen.findByRole("alertdialog", { name: "Block this sender?" })
    ).toBeVisible();
    await expect(
      screen.getByRole("radio", { name: "Block and delete this message" })
    ).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: BLOCK_REGEX }));
    await expect(args.onConfirm).toHaveBeenCalledWith(
      args.message?.senderHash,
      false,
      true
    );
  },
};

export const Unblock: Story = {
  args: { isSenderBlocked: true },
  play: async ({ args, userEvent }) => {
    await expect(
      await screen.findByRole("alertdialog", { name: "Unblock this sender?" })
    ).toBeVisible();
    await expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: UNBLOCK_REGEX }));
    await expect(args.onConfirm).toHaveBeenCalledWith(
      args.message?.senderHash,
      true,
      false
    );
  },
};

export const BlockOnly: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("radio", { name: "Block only" })
    );
    await userEvent.click(screen.getByRole("button", { name: BLOCK_REGEX }));
    await expect(args.onConfirm).toHaveBeenCalledWith(
      args.message?.senderHash,
      false,
      false
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
