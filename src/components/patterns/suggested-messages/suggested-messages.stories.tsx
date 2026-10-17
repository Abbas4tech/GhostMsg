import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { suggestionScenarios } from "@/mock/fixtures/public-profile.fixtures";
import { SuggestedMessages } from "./suggested-messages";
import {
  defaultSuggestedMessagesArgs,
  emptySuggestedMessagesArgs,
  longSuggestedMessagesArgs,
} from "./suggested-messages.mock";

const SUGGEST_REGEX = /new ideas/i;

const meta = {
  args: { ...defaultSuggestedMessagesArgs, onRefresh: fn(), onSelect: fn() },
  argTypes: {
    isLoading: {
      control: "boolean",
      description: "Spins the refresh icon and disables the button",
    },
    onRefresh: { description: "Suggest Messages clicked" },
    onSelect: { description: "Suggestion clicked → its text" },
    suggestions: {
      control: "object",
      description: "AI prompts; the card is hidden when empty",
    },
  },
  component: SuggestedMessages,
  tags: ["autodocs"],
  title: "Patterns/SuggestedMessages",
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
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
