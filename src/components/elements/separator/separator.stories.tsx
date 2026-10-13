import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Separator } from "./separator";
import { SEPARATOR_ORIENTATIONS, separatorMockContent } from "./separator.mock";

const meta = {
  title: "Elements/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { orientation: "horizontal", decorative: false },
  argTypes: {
    orientation: {
      control: "radio",
      options: SEPARATOR_ORIENTATIONS,
      description: "Line direction",
    },
    decorative: {
      control: "boolean",
      description: "Hide from assistive tech when purely visual",
    },
  },
  render: (args) => (
    <div
      className={
        args.orientation === "vertical"
          ? "flex h-6 items-center gap-3 text-sm"
          : "flex w-64 flex-col gap-3 text-sm"
      }
    >
      <span>{separatorMockContent.before}</span>
      <Separator {...args} />
      <span>{separatorMockContent.after}</span>
    </div>
  ),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).toHaveAttribute(
      "data-orientation",
      "horizontal"
    );
  },
};

export const Vertical: Story = { args: { orientation: "vertical" } };
