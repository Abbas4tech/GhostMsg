import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { toggleGroupMockContent } from "./toggle-group.mock";

const meta = {
  args: {
    defaultValue: "balanced",
    onValueChange: fn(),
    size: "touch",
    type: "single",
    variant: "segment",
  },
  argTypes: {
    onValueChange: { description: "Called with the selected value" },
    size: {
      control: "radio",
      description: "Item height",
      options: ["sm", "default", "lg", "touch"],
    },
    spacing: {
      control: "number",
      description: "Gap between items (0 = joined)",
    },
    variant: {
      control: "select",
      description: "`segment` = track with a raised thumb, `chip` = pills",
      options: ["default", "outline", "chip", "segment"],
    },
  },
  component: ToggleGroup,
  parameters: { layout: "centered" },
  render: (args) => (
    <ToggleGroup {...args} aria-label={toggleGroupMockContent.label}>
      {toggleGroupMockContent.options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  ),
  tags: ["autodocs"],
  title: "Elements/ToggleGroup",
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Segment: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("radio", { name: "Balanced" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Strict" }));
    await expect(args.onValueChange).toHaveBeenCalledWith("strict");
  },
};

export const Chips: Story = { args: { spacing: 2, variant: "chip" } };

export const Outline: Story = { args: { size: "default", variant: "outline" } };
