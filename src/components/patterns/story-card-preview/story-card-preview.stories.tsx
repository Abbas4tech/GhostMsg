import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { StoryCardPreview } from "./story-card-preview";
import {
  defaultStoryCardPreviewArgs,
  questionOnlyStoryCardPreviewArgs,
} from "./story-card-preview.mock";

const meta = {
  title: "Patterns/StoryCardPreview",
  component: StoryCardPreview,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: defaultStoryCardPreviewArgs,
  argTypes: {
    question: { control: "text", description: "The Anonymous Message" },
    answer: { control: "text", description: "Recipient's answer" },
    label: { control: "text", description: "Sentiment chip" },
    size: {
      control: "radio",
      options: ["sm", "md"],
      description: "Card width",
    },
    tilt: {
      control: "radio",
      options: ["none", "right"],
      description: "Playful tilt",
    },
  },
} satisfies Meta<typeof StoryCardPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Answered: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText(`${args.username} answered`)).toBeVisible();
    await expect(canvas.getByText(args.profileLabel)).toBeVisible();
  },
};

export const QuestionOnly: Story = { args: questionOnlyStoryCardPreviewArgs };

export const SmallTilted: Story = { args: { size: "sm", tilt: "right" } };
