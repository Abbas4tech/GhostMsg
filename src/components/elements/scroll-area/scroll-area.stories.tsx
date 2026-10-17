import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ScrollArea } from "./scroll-area";
import { scrollAreaMockContent } from "./scroll-area.mock";

const meta = {
  component: ScrollArea,
  parameters: { layout: "centered" },
  render: (args) => (
    <ScrollArea
      {...args}
      aria-label={scrollAreaMockContent.label}
      className="h-60 w-56 rounded-xl border"
    >
      <ul className="flex flex-col gap-2 p-4 text-sm">
        {scrollAreaMockContent.rows.map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
    </ScrollArea>
  ),
  tags: ["autodocs"],
  title: "Elements/ScrollArea",
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(
      scrollAreaMockContent.rows.length
    );
  },
};
