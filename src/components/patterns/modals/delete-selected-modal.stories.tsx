import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { DeleteSelectedModal } from "./delete-selected-modal";
import { defaultDeleteSelectedModalArgs } from "./modals.mock";

const meta = {
  args: {
    ...defaultDeleteSelectedModalArgs,
    onConfirm: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    count: { control: { min: 1, type: "number" }, description: "Selected" },
    onConfirm: { description: "Delete N clicked" },
    onOpenChange: { description: "Keep them / Escape → false" },
    open: { control: "boolean", description: "Dialog visibility" },
    publicAnswerCount: {
      control: { min: 0, type: "number" },
      description: "How many have a public answer (those go too)",
    },
  },
  component: DeleteSelectedModal,
  tags: ["autodocs"],
  title: "Patterns/Modals/DeleteSelectedModal",
} satisfies Meta<typeof DeleteSelectedModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Design MobAlertDelete: asks first, then deletes at once (no Undo). */
export const Default: Story = {
  play: async ({ args, userEvent }) => {
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete 2 messages?",
    });
    await expect(dialog).toHaveAccessibleDescription(
      "One has a public answer on your profile, so that answer goes too. This can't be undone."
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete 2" }));
    await expect(args.onConfirm).toHaveBeenCalledOnce();
  },
};

export const KeepsThem: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("button", { name: "Keep them" })
    );
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

export const OneMessage: Story = {
  args: { count: 1, publicAnswerCount: 0 },
  play: async () => {
    await expect(
      await screen.findByRole("alertdialog", { name: "Delete 1 message?" })
    ).toBeVisible();
    await expect(screen.getByRole("button", { name: "Keep it" })).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
