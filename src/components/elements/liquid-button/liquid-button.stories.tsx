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
  title: "Elements/LiquidButton",
  component: LiquidButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { ...defaultLiquidButtonArgs, onClick: fn() },
  argTypes: {
    variant: {
      control: "select",
      options: LIQUID_BUTTON_VARIANTS,
      description: "Fill color of the liquid hover effect",
    },
    size: {
      control: "radio",
      options: LIQUID_BUTTON_SIZES,
      description: "Height/padding preset",
    },
    disabled: { control: "boolean", description: "Blocks clicks" },
    children: { control: "text", description: "Label / content" },
    onClick: { description: "Click handler" },
  },
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
  args: { variant: "destructive", children: "Block Sender" },
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
    className: "gap-0",
    children: (
      <>
        <RefreshCw className="h-4 w-4" />
        <span className="ml-2">Refresh</span>
      </>
    ),
  },
};

export const Pending: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
      </>
    ),
  },
  play: async ({ args, canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SAVING_REGEX })
    ).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
