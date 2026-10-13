import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  FIXTURE_USERNAME,
  publicAnswerScenarios,
} from "@/mock/fixtures/public-profile.fixtures";
import { PublicQaFeed } from "./public-qa-feed";
import {
  defaultPublicQaFeedArgs,
  emptyPublicQaFeedArgs,
  longReplyPublicQaFeedArgs,
} from "./public-qa-feed.mock";

const meta = {
  title: "Patterns/PublicQaFeed",
  component: PublicQaFeed,
  tags: ["autodocs"],
  args: defaultPublicQaFeedArgs,
  argTypes: {
    username: {
      control: "text",
      description: "Recipient handle used in “@user's Answer”",
    },
    answers: {
      control: "object",
      description: "Published Q&A items; the feed renders nothing when empty",
    },
    isLoading: {
      control: "boolean",
      description: "Shows the spinner (role=status)",
    },
  },
} satisfies Meta<typeof PublicQaFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAnswers: Story = {
  play: async ({ canvas }) => {
    const answers = publicAnswerScenarios.some;
    await expect(
      canvas.getByRole("heading", { name: "Public Q&A" })
    ).toBeVisible();
    await expect(canvas.getAllByRole("article")).toHaveLength(answers.length);
    await expect(
      canvas.getAllByText(`${FIXTURE_USERNAME} answered:`)
    ).toHaveLength(answers.length);
    await expect(canvas.getByText(answers[0].reply.text)).toBeVisible();
    await expect(canvas.getByText("Curious")).toBeVisible();
  },
};

export const Loading: Story = {
  args: { isLoading: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("status", { name: "Loading public answers" })
    ).toBeVisible();
  },
};

export const Empty: Story = {
  args: emptyPublicQaFeedArgs,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="public-qa-feed"]')
    ).toBeNull();
  },
};

export const LongReply: Story = { args: longReplyPublicQaFeedArgs };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
