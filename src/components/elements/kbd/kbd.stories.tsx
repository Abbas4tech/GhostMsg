import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Kbd } from "./kbd";
import { defaultKbdArgs } from "./kbd.mock";

const meta = {
  title: "Elements/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: defaultKbdArgs,
  argTypes: { children: { control: "text", description: "Key label" } },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("⌘K").tagName).toBe("KBD");
  },
};

export const Shortcuts: Story = {
  render: () => (
    <span className="flex items-center gap-3 text-muted-foreground text-sm">
      <span>
        <Kbd>j</Kbd> <Kbd>k</Kbd> move
      </span>
      <span>
        <Kbd>/</Kbd> search
      </span>
    </span>
  ),
};
