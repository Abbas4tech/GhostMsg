import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { sweetMessage } from "@/mock/fixtures/messages.fixtures";
import { defaultStoryCardModalArgs } from "./modals.mock";
import { StoryCardModal } from "./story-card-modal";

const CYBERPUNK_REGEX = /cyberpunk/i;
const DOWNLOAD_REGEX = /download png/i;

/** 9:16 canvas story-card generator. Owns only local UI state (theme, copied). */
const meta = {
  title: "Patterns/Modals/StoryCardModal",
  component: StoryCardModal,
  tags: ["autodocs"],
  args: { ...defaultStoryCardModalArgs, onClose: fn() },
  argTypes: {
    isOpen: { control: "boolean", description: "Dialog visibility" },
    message: {
      control: "object",
      description: "Message (and reply, if any) drawn onto the card",
    },
    username: {
      control: "text",
      description: "Handle printed on the card and CTA",
    },
    onClose: { description: "Escape / overlay / close" },
  },
} satisfies Meta<typeof StoryCardModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithReply: Story = {
  play: async ({ userEvent }) => {
    await expect(
      await screen.findByRole("dialog", { name: "Social Story Card Generator" })
    ).toBeVisible();
    const cyberpunk = screen.getByRole("button", { name: CYBERPUNK_REGEX });
    await userEvent.click(cyberpunk);
    await expect(
      screen.getByRole("button", { name: DOWNLOAD_REGEX })
    ).toBeEnabled();
  },
};

export const WithoutReply: Story = { args: { message: sweetMessage } };

export const ClosesOnEscape: Story = {
  play: async ({ args, userEvent }) => {
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalled();
  },
};
