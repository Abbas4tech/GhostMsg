import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Button } from "@/components/elements/button";
import { Spinner } from "./spinner";
import { spinnerMockContent } from "./spinner.mock";

const meta = {
  component: Spinner,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/Spinner",
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status", { name: "Loading" })).toBeVisible();
  },
};

export const InButton: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
  render: (args) => (
    <Button disabled>
      <Spinner {...args} data-icon="inline-start" />
      {spinnerMockContent.button}
    </Button>
  ),
};
