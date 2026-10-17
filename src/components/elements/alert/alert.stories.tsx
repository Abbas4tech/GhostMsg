import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShieldCheckIcon } from "lucide-react";
import { expect } from "storybook/test";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { ALERT_VARIANTS, alertMockContent } from "./alert.mock";

const meta = {
  args: { variant: "default" },
  argTypes: {
    variant: {
      control: "radio",
      description: "Visual tone",
      options: ALERT_VARIANTS,
    },
  },
  component: Alert,
  parameters: { layout: "padded" },
  render: (args) => (
    <Alert {...args} className="max-w-lg">
      <ShieldCheckIcon />
      <AlertTitle>{alertMockContent.title}</AlertTitle>
      <AlertDescription>{alertMockContent.description}</AlertDescription>
    </Alert>
  ),
  tags: ["autodocs"],
  title: "Elements/Alert",
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      alertMockContent.title
    );
  },
};

export const Destructive: Story = { args: { variant: "destructive" } };
