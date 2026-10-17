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
  args: { ...defaultThemeTogglerArgs, onClick: fn() },
  argTypes: {
    direction: {
      control: "select",
      description: "View-transition wipe direction",
      options: ["ltr", "rtl", "ttb", "btt"],
    },
    modes: {
      control: "check",
      description: "Themes cycled through, in order",
      options: ["light", "dark", "system"],
    },
    onClick: { description: "Click handler" },
    size: {
      control: "radio",
      description: "Square size",
      options: ["xs", "sm", "default", "lg"],
    },
    variant: {
      control: "select",
      description: "Button style",
      options: [
        "default",
        "accent",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
  },
  component: ThemeTogglerButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/ThemeToggler",
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
