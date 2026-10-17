import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Skeleton } from "./skeleton";
import { defaultSkeletonArgs } from "./skeleton.mock";

const meta = {
  args: defaultSkeletonArgs,
  argTypes: {
    className: {
      control: "text",
      description: "Size/shape utilities (e.g. `h-10 w-64 rounded-full`)",
    },
  },
  component: Skeleton,
  tags: ["autodocs"],
  title: "Elements/Skeleton",
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="skeleton"]')
    ).toHaveClass("animate-pulse");
  },
};

export const Avatar: Story = { args: { className: "size-12 rounded-full" } };

export const CardPlaceholder: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-80 flex-col gap-3 rounded-xl border p-4">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-32" />
    </div>
  ),
};
