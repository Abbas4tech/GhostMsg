import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { UnsavedChangesBar } from "./unsaved-changes-bar";
import { defaultUnsavedChangesBarArgs } from "./unsaved-changes-bar.mock";

const SAVE_REGEX = /save changes/i;

const meta = {
  args: { ...defaultUnsavedChangesBarArgs, onDiscard: fn(), onSave: fn() },
  argTypes: {
    isSaving: { control: "boolean", description: "Spinner, both disabled" },
    isVisible: { control: "boolean", description: "Renders only when dirty" },
    onDiscard: { description: "Discard clicked" },
    onSave: { description: "Save changes clicked" },
  },
  component: UnsavedChangesBar,
  tags: ["autodocs"],
  title: "Patterns/UnsavedChangesBar",
} satisfies Meta<typeof UnsavedChangesBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("region", { name: "Unsaved changes" })
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Discard" }));
    await expect(args.onDiscard).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(args.onSave).toHaveBeenCalledOnce();
  },
};

export const Saving: Story = {
  args: { isSaving: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SAVE_REGEX })
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Discard" })
    ).toBeDisabled();
  },
};

export const Hidden: Story = {
  args: { isVisible: false },
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("region", { name: "Unsaved changes" })
    ).not.toBeInTheDocument();
  },
};
