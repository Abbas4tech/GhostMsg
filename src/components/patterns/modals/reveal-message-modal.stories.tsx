import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { defaultRevealMessageModalArgs } from "./modals.mock";
import { RevealMessageModal } from "./reveal-message-modal";

/** Opt-in reveal of a Quarantined Message; "Keep hidden" has initial focus. */
const meta = {
  args: { ...defaultRevealMessageModalArgs, onClose: fn(), onConfirm: fn() },
  argTypes: {
    message: { control: "object", description: "Quarantined message" },
    onClose: { description: "Keep hidden / Escape" },
    onConfirm: { description: "Reveal once → message" },
    open: { control: "boolean", description: "Dialog visibility" },
  },
  component: RevealMessageModal,
  tags: ["autodocs"],
  title: "Patterns/Modals/RevealMessageModal",
} satisfies Meta<typeof RevealMessageModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeepHiddenIsDefault: Story = {
  play: async ({ args, userEvent }) => {
    await expect(
      await screen.findByRole("alertdialog", { name: "Reveal this message?" })
    ).toBeVisible();
    await expect(
      screen.getByRole("button", { name: "Keep hidden" })
    ).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Reveal once" }));
    await expect(args.onConfirm).toHaveBeenCalledWith(args.message);
  },
};

export const KeepHidden: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("button", { name: "Keep hidden" })
    );
    await expect(args.onClose).toHaveBeenCalled();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
