import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { BrandMark } from "./brand-mark";
import { defaultBrandMarkArgs } from "./brand-mark.mock";

const meta = {
  args: defaultBrandMarkArgs,
  argTypes: {
    href: { control: "text", description: "Optional link target" },
    iconOnly: { control: "boolean", description: "Hide the wordmark" },
    size: {
      control: "radio",
      description: "Tile size",
      options: ["sm", "md"],
    },
  },
  component: BrandMark,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Patterns/BrandMark",
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

export const Small: Story = { args: { href: undefined, size: "sm" } };

export const IconOnly: Story = { args: { iconOnly: true } };
