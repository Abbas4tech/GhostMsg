import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, within } from "storybook/test";
import { ShortcutSheet } from "./shortcut-sheet";
import { defaultShortcutSheetArgs } from "./shortcut-sheet.mock";

/** `?` in the dashboard: the design UX board's keyboard map. */
const meta = {
  args: { ...defaultShortcutSheetArgs, onOpenChange: fn() },
  argTypes: {
    groups: { control: "object", description: "Shortcut groups" },
    onOpenChange: { description: "Open state changed (Escape, overlay)" },
    open: { control: "boolean", description: "Dialog visibility" },
  },
  component: ShortcutSheet,
  tags: ["autodocs"],
  title: "Patterns/ShortcutSheet",
} satisfies Meta<typeof ShortcutSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async () => {
    const dialog = await screen.findByRole("dialog", {
      name: "Keyboard shortcuts",
    });
    await expect(
      within(dialog).getByRole("heading", { name: "Inbox" })
    ).toBeVisible();
    await expect(within(dialog).getByText("Archive")).toBeVisible();
    await expect(within(dialog).getByText("Go to Settings")).toBeVisible();
  },
};

export const ClosesWithDone: Story = {
  play: async ({ args, userEvent }) => {
    const dialog = await screen.findByRole("dialog", {
      name: "Keyboard shortcuts",
    });
    await userEvent.click(within(dialog).getByRole("button", { name: "Done" }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

export const ClosesOnEscape: Story = {
  play: async ({ args, userEvent }) => {
    await screen.findByRole("dialog", { name: "Keyboard shortcuts" });
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
