import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
} from "@/mock/fixtures/public-profile.fixtures";
import { AmaBanner, DEFAULT_AMA_PROMPT } from "./ama-banner";
import { defaultAmaBannerArgs, longAmaBannerArgs } from "./ama-banner.mock";

const meta = {
  args: defaultAmaBannerArgs,
  argTypes: {
    children: { control: false, description: "Custom body (paused note)" },
    eyebrow: { control: "text", description: "Small line above the prompt" },
    prompt: {
      control: "text",
      description: "AMA Prompt; empty/null falls back to the default",
    },
    size: {
      control: "radio",
      description: "Padding",
      options: ["sm", "md", "lg"],
    },
    tone: {
      control: "radio",
      description: "brand = accepting, soft = preview, quiet = paused",
      options: ["brand", "soft", "quiet"],
    },
  },
  component: AmaBanner,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  title: "Patterns/AmaBanner",
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

export const Soft: Story = { args: { size: "sm", tone: "soft" } };

export const QuietPaused: Story = {
  args: {
    children: <p className="text-muted-foreground">Messages are paused.</p>,
    eyebrow: "Paused",
    tone: "quiet",
  },
};

export const LongContent: Story = { args: longAmaBannerArgs };

export const Mobile: Story = {
  args: longAmaBannerArgs,
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
