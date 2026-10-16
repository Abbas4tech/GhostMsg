import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { BrandMark } from "./brand-mark";
import { defaultBrandMarkArgs } from "./brand-mark.mock";

const meta = {
  title: "Patterns/BrandMark",
  component: BrandMark,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: defaultBrandMarkArgs,
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md"],
      description: "Tile size",
    },
    href: { control: "text", description: "Optional link target" },
    iconOnly: { control: "boolean", description: "Hide the wordmark" },
  },
} satisfies Meta<typeof BrandMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeLink: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: "GhostMsg" })
    ).toHaveAttribute("href", "/");
  },
};

export const Small: Story = { args: { size: "sm", href: undefined } };

export const IconOnly: Story = { args: { iconOnly: true } };
