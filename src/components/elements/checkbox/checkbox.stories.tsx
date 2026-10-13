import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Label } from "@/components/elements/label";
import { Checkbox } from "./checkbox";
import { CHECKBOX_SIZES, checkboxMockContent } from "./checkbox.mock";

const meta = {
  title: "Elements/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { size: "default", onCheckedChange: fn() },
  argTypes: {
    size: {
      control: "radio",
      options: CHECKBOX_SIZES,
      description: "Box size (`lg` = 22px touch target for cards)",
    },
    disabled: { control: "boolean", description: "Prevents toggling" },
    onCheckedChange: { description: "Called with the next checked state" },
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="checkbox-demo" />
      <Label htmlFor="checkbox-demo">{checkboxMockContent.label}</Label>
    </div>
  ),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const box = canvas.getByRole("checkbox", {
      name: checkboxMockContent.label,
    });
    await userEvent.click(box);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    await expect(box).toBeChecked();
  },
};

export const Large: Story = { args: { size: "lg" } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox")).toBeDisabled();
  },
};
