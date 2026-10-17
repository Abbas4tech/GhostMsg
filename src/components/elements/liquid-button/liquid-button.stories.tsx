import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Loader2, RefreshCw } from "lucide-react";
import { expect, fn } from "storybook/test";
import { LiquidButton } from "./liquid-button";
import {
  defaultLiquidButtonArgs,
  LIQUID_BUTTON_SIZES,
  LIQUID_BUTTON_VARIANTS,
} from "./liquid-button.mock";

const SAVING_REGEX = /saving/i;

const meta = {
  args: { ...defaultLiquidButtonArgs, onClick: fn() },
  argTypes: {
    children: { control: "text", description: "Label / content" },
    disabled: { control: "boolean", description: "Blocks clicks" },
    onClick: { description: "Click handler" },
    size: {
      control: "radio",
      description: "Height/padding preset",
      options: LIQUID_BUTTON_SIZES,
    },
    variant: {
      control: "select",
      description: "Fill color of the liquid hover effect",
      options: LIQUID_BUTTON_VARIANTS,
    },
  },
  component: LiquidButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/LiquidButton",
} satisfies Meta<typeof LiquidButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Save Topic Banner" })
    );
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Destructive: Story = {
  args: { children: "Block Sender", variant: "destructive" },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {LIQUID_BUTTON_VARIANTS.map((variant) => (
        <LiquidButton {...args} asChild={false} key={variant} variant={variant}>
          {variant}
        </LiquidButton>
      ))}
    </div>
  ),
};

export const Refresh: Story = {
  args: {
    children: (
      <>
        <RefreshCw className="h-4 w-4" />
        <span className="ml-2">Refresh</span>
      </>
    ),
    className: "gap-0",
  },
};

export const Pending: Story = {
  args: {
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
      </>
    ),
    disabled: true,
  },
  play: async ({ args, canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SAVING_REGEX })
    ).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
