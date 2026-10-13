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
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: defaultAmaBannerArgs,
  argTypes: {
    prompt: {
      control: "text",
      description: "AMA Prompt; empty/null falls back to the default",
    },
    eyebrow: { control: "text", description: "Small line above the prompt" },
    tone: {
      control: "radio",
      options: ["brand", "soft", "quiet"],
      description: "brand = accepting, soft = preview, quiet = paused",
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Padding",
    },
    children: { control: false, description: "Custom body (paused note)" },
  },
} satisfies Meta<typeof AmaBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText(`AMA · ${FIXTURE_USERNAME}`)).toBeVisible();
    await expect(canvas.getByText(FIXTURE_AMA_PROMPT)).toBeVisible();
  },
};

export const DefaultPrompt: Story = {
  args: { prompt: null },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(DEFAULT_AMA_PROMPT)).toBeVisible();
  },
};

export const Soft: Story = { args: { tone: "soft", size: "sm" } };

export const QuietPaused: Story = {
  args: {
    tone: "quiet",
    eyebrow: "Paused",
    children: <p className="text-muted-foreground">Messages are paused.</p>,
  },
};

export const LongContent: Story = { args: longAmaBannerArgs };

export const Mobile: Story = {
  args: longAmaBannerArgs,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
