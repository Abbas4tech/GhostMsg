import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Badge } from "./badge";
import { BADGE_VARIANTS, countBadgeArgs, defaultBadgeArgs } from "./badge.mock";

const meta = {
  args: defaultBadgeArgs,
  argTypes: {
    children: { control: "text", description: "Badge text" },
    variant: {
      control: "select",
      description: "Visual style",
      options: BADGE_VARIANTS,
    },
  },
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/Badge",
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

export const Count: Story = {
  args: countBadgeArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("12")).toHaveAttribute(
      "data-variant",
      "count"
    );
  },
};

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

export const LongText: Story = {
  args: { children: "Answered and published to the public profile" },
};
