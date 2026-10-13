import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Label } from "@/components/elements/label";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { radioGroupMockContent } from "./radio-group.mock";

const meta = {
  title: "Elements/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { defaultValue: "instant", onValueChange: fn() },
  argTypes: {
    defaultValue: {
      control: "radio",
      options: radioGroupMockContent.options.map((option) => option.value),
      description: "Initially selected value",
    },
    disabled: { control: "boolean", description: "Disables every option" },
    onValueChange: { description: "Called with the selected value" },
  },
  render: (args) => (
    <RadioGroup {...args} aria-label={radioGroupMockContent.label}>
      {radioGroupMockContent.options.map((option) => (
        <div className="flex items-center gap-2" key={option.value}>
          <RadioGroupItem id={`radio-${option.value}`} value={option.value} />
          <Label htmlFor={`radio-${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("radio", { name: "Instant" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Daily digest" }));
    await expect(args.onValueChange).toHaveBeenCalledWith("daily");
  },
};

export const Disabled: Story = { args: { disabled: true } };
