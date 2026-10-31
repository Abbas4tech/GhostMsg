import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { QaShowcase } from "./qa-showcase";
import { defaultQaShowcaseArgs } from "./qa-showcase.mock";

const meta = {
  args: defaultQaShowcaseArgs,
  argTypes: {
    answer: { control: "text", description: "Example answer" },
    question: { control: "text", description: "Example question" },
    sentiment: {
      control: "select",
      description: "Sentiment Tag",
      options: ["sweet", "curious", "spicy", "advice", "neutral"],
    },
  },
  component: QaShowcase,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Blocks/QaShowcase",
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

/** Design MobLanding: heading, short lead and the tilted Story Card only. */
export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
