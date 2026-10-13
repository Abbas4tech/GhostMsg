import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Badge } from "./badge";
import {
  BADGE_SIZES,
  BADGE_VARIANTS,
  countBadgeArgs,
  defaultBadgeArgs,
} from "./badge.mock";

const meta = {
  title: "Elements/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: defaultBadgeArgs,
  argTypes: {
    variant: {
      control: "select",
      options: BADGE_VARIANTS,
      description: "Visual style",
    },
    size: {
      control: "radio",
      options: BADGE_SIZES,
      description: "Padding + text size",
    },
    children: { control: "text", description: "Badge text" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Public")).toHaveAttribute(
      "data-slot",
      "badge"
    );
  },
};

export const Count: Story = { args: countBadgeArgs };

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {BADGE_VARIANTS.map((variant) => (
        <Badge {...args} key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-2">
      {BADGE_SIZES.map((size) => (
        <Badge {...args} key={size} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};

export const LongText: Story = {
  args: { children: "Answered and published to the public profile" },
};
