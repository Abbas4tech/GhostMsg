import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Separator } from "./separator";
import { SEPARATOR_ORIENTATIONS, separatorMockContent } from "./separator.mock";

const meta = {
  args: { decorative: false, orientation: "horizontal" },
  argTypes: {
    decorative: {
      control: "boolean",
      description: "Hide from assistive tech when purely visual",
    },
    orientation: {
      control: "radio",
      description: "Line direction",
      options: SEPARATOR_ORIENTATIONS,
    },
  },
  component: Separator,
  parameters: { layout: "centered" },
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
  tags: ["autodocs"],
  title: "Elements/Separator",
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
