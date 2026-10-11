import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Star } from "lucide-react";
import { expect, fn } from "storybook/test";
import { IconButton } from "./icon-button";
import {
  defaultIconButtonArgs,
  ICON_BUTTON_SIZES,
  ICON_BUTTON_VARIANTS,
} from "./icon-button.mock";

const meta = {
  title: "Elements/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { ...defaultIconButtonArgs, onClick: fn(), children: <Star /> },
  argTypes: {
    variant: {
      control: "select",
      options: ICON_BUTTON_VARIANTS,
      description: "Visual style",
    },
    size: {
      control: "radio",
      options: ICON_BUTTON_SIZES,
      description: "Square size",
    },
    "aria-label": {
      control: "text",
      description: "Required accessible name (icon-only control)",
    },
    onClick: { description: "Click handler; also bursts the particle effect" },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Star message" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {ICON_BUTTON_VARIANTS.map((variant) => (
        <IconButton
          {...args}
          aria-label={`Star (${variant})`}
          key={variant}
          variant={variant}
        >
          <Star />
        </IconButton>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-3">
      {ICON_BUTTON_SIZES.map((size) => (
        <IconButton
          {...args}
          aria-label={`Star (${size})`}
          key={size}
          size={size}
        >
          <Star />
        </IconButton>
      ))}
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };
