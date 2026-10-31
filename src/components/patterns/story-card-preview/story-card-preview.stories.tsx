import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { StoryCardPreview } from "./story-card-preview";
import {
  defaultStoryCardPreviewArgs,
  questionOnlyStoryCardPreviewArgs,
} from "./story-card-preview.mock";

const meta = {
  args: defaultStoryCardPreviewArgs,
  argTypes: {
    answer: { control: "text", description: "Recipient's answer" },
    label: { control: "text", description: "Sentiment chip" },
    question: { control: "text", description: "The Anonymous Message" },
    size: {
      control: "radio",
      description: "Card width (fluid: 220px on phones, 280px from sm)",
      options: ["fluid", "sm", "md"],
    },
    tilt: {
      control: "radio",
      description: "Playful tilt (fluid: left on phones, right from sm)",
      options: ["none", "right", "fluid"],
    },
  },
  component: StoryCardPreview,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Patterns/StoryCardPreview",
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

/** Landing on a phone (design MobLanding): 220px, tilted left. */
export const FluidOnPhone: Story = {
  args: { size: "fluid", tilt: "fluid" },
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
