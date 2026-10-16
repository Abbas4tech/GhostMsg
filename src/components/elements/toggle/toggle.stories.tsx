import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StarIcon } from "lucide-react";
import { expect, fn } from "storybook/test";
import { Toggle } from "./toggle";
import {
  TOGGLE_SIZES,
  TOGGLE_VARIANTS,
  toggleMockContent,
} from "./toggle.mock";

const meta = {
  title: "Elements/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { variant: "default", size: "default", onPressedChange: fn() },
  argTypes: {
    variant: {
      control: "select",
      options: TOGGLE_VARIANTS,
      description: "`chip` = filter pill, `segment` = segmented control",
    },
    size: {
      control: "radio",
      options: TOGGLE_SIZES,
      description: "`touch` = 44px tap target",
    },
    disabled: { control: "boolean", description: "Prevents toggling" },
    onPressedChange: { description: "Called with the next pressed state" },
  },
  render: (args) => (
    <Toggle {...args}>
      <StarIcon />
      {toggleMockContent.label}
    </Toggle>
  ),
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole("button", {
      name: toggleMockContent.label,
    });
    await userEvent.click(toggle);
    await expect(args.onPressedChange).toHaveBeenCalledWith(true);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  },
};

export const Chip: Story = { args: { variant: "chip", size: "touch" } };

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {TOGGLE_VARIANTS.map((variant) => (
        <Toggle {...args} defaultPressed key={variant} variant={variant}>
          {variant}
        </Toggle>
      ))}
    </div>
  ),
};
