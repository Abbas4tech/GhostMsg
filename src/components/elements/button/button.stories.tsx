import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Loader2, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { expect, fn } from "storybook/test";
import { Button } from "./button";
import {
  BUTTON_ICON_SIZES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  defaultButtonArgs,
  destructiveButtonArgs,
} from "./button.mock";

const meta = {
  title: "Elements/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { ...defaultButtonArgs, onClick: fn() },
  argTypes: {
    variant: {
      control: "select",
      options: BUTTON_VARIANTS,
      description: "Visual style. `default` is the original shadcn look.",
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: "select",
      options: [...BUTTON_SIZES, ...BUTTON_ICON_SIZES, "md"],
      description: "Height/padding preset. `icon*` sizes are square.",
      table: { defaultValue: { summary: "default" } },
    },
    disabled: {
      control: "boolean",
      description: "Blocks clicks and dims the button",
    },
    asChild: {
      control: false,
      description: "Render the child element (e.g. a Link) with button styles",
    },
    children: { control: "text", description: "Label / content" },
    onClick: { description: "Click handler" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Destructive: Story = { args: destructiveButtonArgs };

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {BUTTON_VARIANTS.map((variant) => (
        <Button {...args} asChild={false} key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const variant of BUTTON_VARIANTS) {
      await expect(canvas.getByRole("button", { name: variant })).toBeVisible();
    }
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-3">
      {BUTTON_SIZES.map((size) => (
        <Button {...args} asChild={false} key={size} size={size}>
          {size}
        </Button>
      ))}
      {BUTTON_ICON_SIZES.map((size) => (
        <Button
          {...args}
          aria-label={`Send (${size})`}
          asChild={false}
          key={size}
          size={size}
        >
          <Send />
        </Button>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Send /> Send
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    "aria-label": "Delete message",
    children: <Trash2 />,
    size: "icon",
    variant: "ghost",
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Delete message" })
    ).toBeVisible();
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="animate-spin" /> Sending...
      </>
    ),
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole("button", { name: "Send message" });
    await expect(button).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const AsLink: Story = {
  args: {
    asChild: true,
    children: <Link href="/sign-up">Sign Up</Link>,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
      "href",
      "/sign-up"
    );
  },
};

export const LongLabel: Story = {
  args: {
    children: "Publish this answer to my public profile showcase right now",
  },
};
