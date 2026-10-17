import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { SentimentBadge } from "./sentiment-badge";
import {
  defaultSentimentBadgeArgs,
  SENTIMENT_BADGE_SIZES,
  SENTIMENTS,
} from "./sentiment-badge.mock";

const meta = {
  args: defaultSentimentBadgeArgs,
  argTypes: {
    sentiment: {
      control: "select",
      description:
        "AI sentiment tag. Unknown or missing values fall back to `neutral` (“Note”).",
      options: [...SENTIMENTS, null],
    },
    size: {
      control: "radio",
      description: "Padding + text size",
      options: SENTIMENT_BADGE_SIZES,
    },
  },
  component: SentimentBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Patterns/SentimentBadge",
} satisfies Meta<typeof SentimentBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sweet: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sweet")).toBeVisible();
    await expect(canvas.getByText("💖")).toHaveAttribute("aria-hidden", "true");
  },
};

export const Spicy: Story = {
  args: { sentiment: "spicy" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Spicy").parentElement).toHaveClass(
      "text-sentiment-spicy"
    );
  },
};

export const Curious: Story = { args: { sentiment: "curious" } };
export const Advice: Story = { args: { sentiment: "advice" } };

export const MissingSentiment: Story = {
  args: { sentiment: null },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Note")).toBeVisible();
  },
};

export const AllSentiments: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {SENTIMENTS.map((sentiment) => (
        <SentimentBadge {...args} key={sentiment} sentiment={sentiment} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex items-center gap-2">
      {SENTIMENT_BADGE_SIZES.map((size) => (
        <SentimentBadge {...args} key={size} size={size} />
      ))}
    </div>
  ),
};
