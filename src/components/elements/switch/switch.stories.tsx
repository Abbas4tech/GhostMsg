import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Label } from "@/components/elements/label";
import { Switch } from "./switch";
import {
  checkedSwitchArgs,
  defaultSwitchArgs,
  SWITCH_SIZES,
  SWITCH_VARIANTS,
} from "./switch.mock";

const meta = {
  args: { ...defaultSwitchArgs, onCheckedChange: fn() },
  argTypes: {
    checked: { control: "boolean", description: "Controlled checked state" },
    disabled: { control: "boolean", description: "Prevents toggling" },
    onCheckedChange: { description: "Called with the next checked state" },
    size: {
      control: "radio",
      description: "Track/thumb size (`md` = original)",
      options: SWITCH_SIZES,
    },
    variant: {
      control: "radio",
      description: "Checked track color",
      options: SWITCH_VARIANTS,
    },
  },
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/Switch",
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole("switch", { name: "Accept messages" });
    await expect(toggle).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(toggle);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    await expect(toggle).toHaveAttribute("data-state", "checked");
  },
};

export const Checked: Story = { args: checkedSwitchArgs };

export const Success: Story = {
  args: { ...checkedSwitchArgs, variant: "success" },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-4">
      {SWITCH_SIZES.map((size) => (
        <Switch
          {...args}
          aria-label={`Size ${size}`}
          defaultChecked
          key={size}
          size={size}
        />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole("switch", { name: "Accept messages" });
    await expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const WithLabel: Story = {
  args: { "aria-label": undefined, id: "accept-messages" },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Accept Messages"));
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Switch {...args} />
      <Label htmlFor="accept-messages">Accept Messages</Label>
    </div>
  ),
};
