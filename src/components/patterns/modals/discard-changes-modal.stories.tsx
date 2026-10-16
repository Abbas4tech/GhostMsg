import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { DiscardChangesModal } from "./discard-changes-modal";
import { defaultDiscardChangesModalArgs } from "./modals.mock";

const meta = {
  title: "Patterns/Modals/DiscardChangesModal",
  component: DiscardChangesModal,
  tags: ["autodocs"],
  args: {
    ...defaultDiscardChangesModalArgs,
    onDiscard: fn(),
    onKeepEditing: fn(),
  },
  argTypes: {
    open: { control: "boolean", description: "Dialog visibility" },
    onDiscard: { description: "Discard and leave clicked" },
    onKeepEditing: { description: "Keep editing / Escape" },
  },
} satisfies Meta<typeof DiscardChangesModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeepEditingIsDefault: Story = {
  play: async ({ args, userEvent }) => {
    await screen.findByRole("alertdialog", {
      name: "Discard unsaved changes?",
    });
    await expect(
      screen.getByRole("button", { name: "Keep editing" })
    ).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    await expect(args.onKeepEditing).toHaveBeenCalled();
  },
};

export const Discards: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("button", { name: "Discard and leave" })
    );
    await expect(args.onDiscard).toHaveBeenCalledOnce();
  },
};
