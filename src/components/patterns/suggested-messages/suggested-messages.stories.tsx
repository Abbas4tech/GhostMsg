import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { suggestionScenarios } from "@/mock/fixtures/public-profile.fixtures";
import { SuggestedMessages } from "./suggested-messages";
import {
  defaultSuggestedMessagesArgs,
  emptySuggestedMessagesArgs,
  longSuggestedMessagesArgs,
} from "./suggested-messages.mock";

const SUGGEST_REGEX = /suggest messages/i;

const meta = {
  title: "Patterns/SuggestedMessages",
  component: SuggestedMessages,
  tags: ["autodocs"],
  args: { ...defaultSuggestedMessagesArgs, onRefresh: fn(), onSelect: fn() },
  argTypes: {
    suggestions: {
      control: "object",
      description: "AI prompts; the card is hidden when empty",
    },
    isLoading: {
      control: "boolean",
      description: "Spins the refresh icon and disables the button",
    },
    onRefresh: { description: "Suggest Messages clicked" },
    onSelect: { description: "Suggestion clicked → its text" },
  },
} satisfies Meta<typeof SuggestedMessages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const [first, second] = suggestionScenarios.default;
    await userEvent.click(canvas.getByRole("button", { name: second }));
    await expect(args.onSelect).toHaveBeenCalledWith(second);
    await expect(canvas.getByRole("button", { name: first })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: SUGGEST_REGEX }));
    await expect(args.onRefresh).toHaveBeenCalledOnce();
  },
};

export const Loading: Story = {
  args: { ...emptySuggestedMessagesArgs, isLoading: true },
  play: async ({ args, canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SUGGEST_REGEX })
    ).toBeDisabled();
    await expect(args.onRefresh).not.toHaveBeenCalled();
  },
};

export const Empty: Story = {
  args: emptySuggestedMessagesArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("button")).toHaveLength(1);
  },
};

export const LongSuggestion: Story = { args: longSuggestedMessagesArgs };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
