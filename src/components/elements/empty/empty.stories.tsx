import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InboxIcon } from "lucide-react";
import { expect } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";
import { emptyMockContent } from "./empty.mock";

const meta = {
  component: Empty,
  parameters: { layout: "padded" },
  render: (args) => (
    <Empty {...args} className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>{emptyMockContent.title}</EmptyTitle>
        <EmptyDescription>{emptyMockContent.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button className="rounded-full">{emptyMockContent.action}</Button>
      </EmptyContent>
    </Empty>
  ),
  tags: ["autodocs"],
  title: "Elements/Empty",
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText(emptyMockContent.title)).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: emptyMockContent.action })
    ).toBeVisible();
  },
};
