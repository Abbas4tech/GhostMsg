import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, waitFor } from "storybook/test";
import { PalettePicker } from "./palette-picker";
import { defaultPalettePickerArgs } from "./palette-picker.mock";

// Item names include the description line, so match on the label.
const SPECTRAL_ITEM = /Soft spectral/;
const MIDNIGHT_ITEM = /Midnight confessional/;
const PAPER_ITEM = /Playful paper/;

/**
 * Picks the colour palette. The toolbar's Palette control previews every
 * palette across the catalog; this story only reports the chosen value.
 */
const meta = {
  title: "Elements/PalettePicker",
  component: PalettePicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { ...defaultPalettePickerArgs, onValueChange: fn() },
  argTypes: {
    value: {
      control: "select",
      options: ["spectral", "midnight", "paper"],
      description: "Selected palette",
    },
    variant: {
      control: "select",
      options: ["default", "accent", "outline", "secondary", "ghost"],
      description: "Trigger style",
    },
    size: {
      control: "radio",
      options: ["xs", "sm", "default", "lg"],
      description: "Trigger size",
    },
    align: {
      control: "radio",
      options: ["start", "center", "end"],
      description: "Menu alignment",
    },
    onValueChange: { description: "Called with the picked palette" },
  },
} satisfies Meta<typeof PalettePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PickPalette: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Color theme" }));
    await expect(
      await screen.findByRole("menuitemradio", { name: SPECTRAL_ITEM })
    ).toHaveAttribute("aria-checked", "true");
    await userEvent.click(
      screen.getByRole("menuitemradio", { name: PAPER_ITEM })
    );
    await expect(args.onValueChange).toHaveBeenCalledWith("paper");
  },
};

export const MidnightSelected: Story = {
  args: { value: "midnight" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Color theme" }));
    await expect(
      await screen.findByRole("menuitemradio", {
        name: MIDNIGHT_ITEM,
      })
    ).toHaveAttribute("aria-checked", "true");
    // Close again so the page isn't left aria-hidden behind the open menu.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
};
