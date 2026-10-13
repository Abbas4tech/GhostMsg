import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
} from "@/mock/fixtures/public-profile.fixtures";
import { AmaBanner, DEFAULT_AMA_PROMPT } from "./ama-banner";
import { defaultAmaBannerArgs, longAmaBannerArgs } from "./ama-banner.mock";

const meta = {
  title: "Patterns/AmaBanner",
  component: AmaBanner,
  tags: ["autodocs"],
  args: defaultAmaBannerArgs,
  argTypes: {
    username: {
      control: "text",
      description: "Recipient handle (rendered as the page h1)",
    },
    prompt: {
      control: "text",
      description:
        "Custom AMA prompt; empty/null falls back to the default prompt",
    },
  },
} satisfies Meta<typeof AmaBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CustomPrompt: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: `@${FIXTURE_USERNAME}` })
    ).toBeVisible();
    await expect(canvas.getByText(`✨ ${FIXTURE_AMA_PROMPT}`)).toBeVisible();
  },
};

export const DefaultPrompt: Story = {
  args: { prompt: null },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(`✨ ${DEFAULT_AMA_PROMPT}`)).toBeVisible();
  },
};

export const LongContent: Story = { args: longAmaBannerArgs };

export const Mobile: Story = {
  args: longAmaBannerArgs,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
