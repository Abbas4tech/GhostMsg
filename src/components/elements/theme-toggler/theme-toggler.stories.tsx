import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ThemeTogglerButton } from "./theme-toggler";
import {
  defaultThemeTogglerArgs,
  withSystemThemeTogglerArgs,
} from "./theme-toggler.mock";

/**
 * In Storybook the theme is forced from the toolbar, so clicking only
 * demonstrates the button + its view-transition; switch themes with the toolbar.
 */
const meta = {
  title: "Elements/ThemeToggler",
  component: ThemeTogglerButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { ...defaultThemeTogglerArgs, onClick: fn() },
  argTypes: {
    modes: {
      control: "check",
      options: ["light", "dark", "system"],
      description: "Themes cycled through, in order",
    },
    variant: {
      control: "select",
      options: [
        "default",
        "accent",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "Button style",
    },
    size: {
      control: "radio",
      options: ["xs", "sm", "default", "lg"],
      description: "Square size",
    },
    direction: {
      control: "select",
      options: ["ltr", "rtl", "ttb", "btt"],
      description: "View-transition wipe direction",
    },
    onClick: { description: "Click handler" },
  },
} satisfies Meta<typeof ThemeTogglerButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightDark: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Toggle theme" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const WithSystem: Story = { args: withSystemThemeTogglerArgs };

export const Ghost: Story = { args: { variant: "ghost" } };
