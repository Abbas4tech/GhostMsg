import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { QaShowcase } from "./qa-showcase";
import { defaultQaShowcaseArgs } from "./qa-showcase.mock";

const meta = {
  title: "Blocks/QaShowcase",
  component: QaShowcase,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: defaultQaShowcaseArgs,
  argTypes: {
    question: { control: "text", description: "Example question" },
    answer: { control: "text", description: "Example answer" },
    sentiment: {
      control: "select",
      options: ["sweet", "curious", "spicy", "advice", "neutral"],
      description: "Sentiment Tag",
    },
  },
} satisfies Meta<typeof QaShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QaAndStoryCard: Story = {
  play: async ({ canvas, args }) => {
    await expect(
      canvas.getByRole("heading", { name: "Answer once. Post it everywhere." })
    ).toBeVisible();
    await expect(canvas.getAllByText(args.answer)).toHaveLength(2);
  },
};
