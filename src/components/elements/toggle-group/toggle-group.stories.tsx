import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { toggleGroupMockContent } from "./toggle-group.mock";

const meta = {
  title: "Elements/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    type: "single",
    variant: "segment",
    size: "touch",
    defaultValue: "balanced",
    onValueChange: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "chip", "segment"],
      description: "`segment` = track with a raised thumb, `chip` = pills",
    },
    size: {
      control: "radio",
      options: ["sm", "default", "lg", "touch"],
      description: "Item height",
    },
    spacing: {
      control: "number",
      description: "Gap between items (0 = joined)",
    },
    onValueChange: { description: "Called with the selected value" },
  },
  render: (args) => (
    <ToggleGroup {...args} aria-label={toggleGroupMockContent.label}>
      {toggleGroupMockContent.options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  ),
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

export const Chips: Story = { args: { variant: "chip", spacing: 2 } };

export const Outline: Story = { args: { variant: "outline", size: "default" } };
