import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Button } from "@/components/elements/button";
import { Spinner } from "./spinner";
import { spinnerMockContent } from "./spinner.mock";

const meta = {
  title: "Elements/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status", { name: "Loading" })).toBeVisible();
  },
};

export const InButton: Story = {
  render: (args) => (
    <Button disabled>
      <Spinner {...args} data-icon="inline-start" />
      {spinnerMockContent.button}
    </Button>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};
