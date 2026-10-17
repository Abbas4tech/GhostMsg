import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Label } from "@/components/elements/label";
import { Checkbox } from "./checkbox";
import { CHECKBOX_SIZES, checkboxMockContent } from "./checkbox.mock";

const meta = {
  args: { onCheckedChange: fn(), size: "default" },
  argTypes: {
    disabled: { control: "boolean", description: "Prevents toggling" },
    onCheckedChange: { description: "Called with the next checked state" },
    size: {
      control: "radio",
      description: "Box size (`lg` = 22px touch target for cards)",
      options: CHECKBOX_SIZES,
    },
  },
  component: Checkbox,
  parameters: { layout: "centered" },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="checkbox-demo" />
      <Label htmlFor="checkbox-demo">{checkboxMockContent.label}</Label>
    </div>
  ),
  tags: ["autodocs"],
  title: "Elements/Checkbox",
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
