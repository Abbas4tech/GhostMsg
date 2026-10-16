import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { CopyButton } from "./copy-button";
import { defaultCopyButtonArgs } from "./copy-button.mock";

const meta = {
  args: { ...defaultCopyButtonArgs, onClick: fn(), onCopiedChange: fn() },
  argTypes: {
    content: { control: "text", description: "Text written to the clipboard" },
    copied: { control: "boolean", description: "Controlled copied state" },
    delay: {
      control: "number",
      description: "ms before the check icon reverts to copy",
    },
    onClick: { description: "Click handler (fires before copying)" },
    onCopiedChange: {
      description: "Called with `true` after copying and `false` after `delay`",
    },
    size: {
      control: "radio",
      description: "Square size",
      options: ["xs", "sm", "default", "lg"],
    },
    variant: {
      control: "select",
      description: "Visual style",
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
  component: CopyButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/CopyButton",
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Copy to clipboard" })
    );
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Copied: Story = {
  args: { copied: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Copied" })).toBeVisible();
  },
};

export const Outline: Story = { args: { variant: "outline" } };
export const Small: Story = { args: { size: "sm" } };
