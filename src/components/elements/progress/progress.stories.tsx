import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Progress } from "./progress";
import { defaultProgressArgs } from "./progress.mock";

const meta = {
  args: defaultProgressArgs,
  argTypes: {
    value: {
      control: { max: 100, min: 0, type: "range" },
      description: "0-100",
    },
  },
  component: Progress,
  parameters: { layout: "centered" },
  render: (args) => (
    <Progress aria-label="Upload progress" {...args} className="w-64" />
  ),
  tags: ["autodocs"],
  title: "Elements/Progress",
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar")).toBeVisible();
  },
};

export const Empty: Story = { args: { value: 0 } };
export const Complete: Story = { args: { value: 100 } };
