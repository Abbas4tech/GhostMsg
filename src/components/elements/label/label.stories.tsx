import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Input } from "@/components/elements/input";
import { Label } from "./label";
import { defaultLabelArgs } from "./label.mock";

const meta = {
  title: "Elements/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: defaultLabelArgs,
  argTypes: {
    htmlFor: { control: "text", description: "id of the labelled control" },
    children: { control: "text", description: "Label text" },
  },
  render: (args) => (
    <div className="flex w-80 flex-col gap-2">
      <Label {...args} />
      <Input id={args.htmlFor} placeholder="Type your message here..." />
    </div>
  ),
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
