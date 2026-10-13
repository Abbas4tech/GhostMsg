import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { FIXTURE_AMA_PROMPT } from "@/mock/fixtures/public-profile.fixtures";
import { VisitorPreview } from "./visitor-preview";
import { defaultVisitorPreviewArgs } from "./visitor-preview.mock";

const meta = {
  title: "Patterns/VisitorPreview",
  component: VisitorPreview,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: defaultVisitorPreviewArgs,
  argTypes: {
    username: { control: "text", description: "Recipient handle" },
    displayName: {
      control: "text",
      description: "Shown instead of the username when set",
    },
    avatarUrl: { control: "text", description: "Photo (data URL) or null" },
    amaPrompt: { control: "text", description: "Draft AMA Prompt" },
    showAmaBanner: { control: "boolean", description: "Banner on/off" },
    isAccepting: { control: "boolean", description: "Message Acceptance" },
  },
} satisfies Meta<typeof VisitorPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const preview = canvas.getByRole("complementary", { name: "Preview" });
    await expect(preview).toHaveTextContent(FIXTURE_AMA_PROMPT);
    await expect(preview).toHaveTextContent("Accepting Anonymous Messages");
  },
};

export const BannerHidden: Story = {
  args: { showAmaBanner: false },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("complementary", { name: "Preview" })
    ).not.toHaveTextContent(FIXTURE_AMA_PROMPT);
  },
};

export const Paused: Story = {
  args: { isAccepting: false },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Messages paused", { exact: false })
    ).toBeVisible();
  },
};

export const NoDisplayName: Story = { args: { displayName: "" } };
