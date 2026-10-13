import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, within } from "storybook/test";
import { CommandPalette, type CommandPaletteProps } from "./command-palette";
import { defaultCommandPaletteArgs } from "./command-palette.mock";

const selectSettings = fn();
const copyLink = fn();

const withSpies = (
  groups: CommandPaletteProps["groups"]
): CommandPaletteProps["groups"] =>
  groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.id === "settings") {
        return { ...item, onSelect: selectSettings };
      }
      if (item.id === "copy-link") {
        return { ...item, onSelect: copyLink };
      }
      return item;
    }),
  }));

/** ⌘K command palette. Items bring their own callbacks. */
const meta = {
  title: "Patterns/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
  args: {
    ...defaultCommandPaletteArgs,
    groups: withSpies(defaultCommandPaletteArgs.groups),
    onOpenChange: fn(),
  },
  argTypes: {
    open: { control: "boolean", description: "Dialog visibility" },
    groups: { control: "object", description: "Command groups" },
    onOpenChange: { description: "Open state changed" },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilterAndRun: Story = {
  play: async ({ args, userEvent }) => {
    const dialog = await screen.findByRole("dialog", {
      name: "Command palette",
    });
    const input = within(dialog).getByRole("combobox", {
      name: "Search commands",
    });
    await userEvent.type(input, "sett");
    await expect(within(dialog).getAllByRole("option")).toHaveLength(1);
    await userEvent.keyboard("{Enter}");
    await expect(selectSettings).toHaveBeenCalledOnce();
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

export const ArrowKeys: Story = {
  play: async ({ userEvent }) => {
    const dialog = await screen.findByRole("dialog");
    const options = within(dialog).getAllByRole("option");
    await expect(options[0]).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowDown}");
    await expect(options[1]).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowUp}{Enter}");
    await expect(copyLink).toHaveBeenCalled();
  },
};

export const NoMatches: Story = {
  parameters: {
    // cmdk keeps an empty role="listbox" while showing its Empty state.
    a11y: {
      config: { rules: [{ id: "aria-required-children", enabled: false }] },
    },
  },
  play: async ({ userEvent }) => {
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(within(dialog).getByRole("combobox"), "zzz");
    await expect(within(dialog).getByText("No commands match.")).toBeVisible();
  },
};
