import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Input } from "@/components/elements/input";
import { Label } from "./label";
import { defaultLabelArgs } from "./label.mock";

const meta = {
  args: defaultLabelArgs,
  argTypes: {
    children: { control: "text", description: "Label text" },
    htmlFor: { control: "text", description: "id of the labelled control" },
  },
  component: Label,
  parameters: { layout: "centered" },
  render: (args) => (
    <div className="flex w-80 flex-col gap-2">
      <Label {...args} />
      <Input id={args.htmlFor} placeholder="Type your message here..." />
    </div>
  ),
  tags: ["autodocs"],
  title: "Elements/Label",
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText(String(defaultLabelArgs.children)));
    await expect(
      canvas.getByRole("textbox", { name: String(defaultLabelArgs.children) })
    ).toHaveFocus();
  },
};

export const DisabledPeer: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-2">
      <Label {...args} />
      <Input disabled id={args.htmlFor} placeholder="Messages are closed" />
    </div>
  ),
};
