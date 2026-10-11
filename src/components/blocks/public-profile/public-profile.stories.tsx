import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect, fn } from "storybook/test";
import { DEFAULT_AMA_PROMPT } from "@/components/patterns/ama-banner";
import type { SendMessageValues } from "@/components/patterns/send-message-form";
import { suggestionScenarios } from "@/mock/fixtures/public-profile.fixtures";
import { messageSchema } from "@/schemas/message-schema";
import { PublicProfile } from "./public-profile";
import {
  defaultPublicProfileArgs,
  newProfilePublicProfileArgs,
  type PublicProfileStoryArgs,
} from "./public-profile.mock";

/** Creates the send form the page controller would own and maps flat args onto the block. */
function PublicProfileHarness(args: PublicProfileStoryArgs): React.JSX.Element {
  const form = useForm<SendMessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
    mode: "onChange",
  });
  return (
    <PublicProfile
      amaPrompt={args.amaPrompt}
      answers={{ items: args.answers, isLoading: args.isLoadingAnswers }}
      sendForm={{
        form,
        isSubmitting: args.isSubmitting,
        onSubmit: args.onSubmit,
      }}
      suggestions={{
        items: args.suggestions,
        isLoading: args.isLoadingSuggestions,
        onRefresh: args.onRefreshSuggestions,
        onSelect: args.onSelectSuggestion,
      }}
      username={args.username}
    />
  );
}

const meta = {
  title: "Blocks/PublicProfile",
  component: PublicProfileHarness,
  tags: ["autodocs"],
  args: {
    ...defaultPublicProfileArgs,
    onRefreshSuggestions: fn(),
    onSelectSuggestion: fn(),
    onSubmit: fn(),
  },
  argTypes: {
    username: { control: "text", description: "Recipient handle" },
    amaPrompt: {
      control: "text",
      description: "AMA banner prompt (null → default prompt)",
    },
    answers: { control: "object", description: "Published Q&A" },
    suggestions: { control: "object", description: "AI suggestions" },
    isLoadingAnswers: { control: "boolean", description: "Q&A feed spinner" },
    isLoadingSuggestions: {
      control: "boolean",
      description: "Suggest button spinner",
    },
    isSubmitting: {
      control: "boolean",
      description: "Send button pending state",
    },
    onSubmit: { description: "Valid message submitted" },
    onSelectSuggestion: {
      description: "Suggestion clicked (page writes it into the form)",
    },
    onRefreshSuggestions: { description: "Suggest Messages clicked" },
  },
} satisfies Meta<typeof PublicProfileHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "@johndoe" })
    ).toBeVisible();
    await expect(
      canvas.getByText("Public Answers & Confessions")
    ).toBeVisible();
    const suggestion = suggestionScenarios.default[2];
    await userEvent.click(canvas.getByRole("button", { name: suggestion }));
    await expect(args.onSelectSuggestion).toHaveBeenCalledWith(suggestion);
  },
};

export const NewProfile: Story = {
  args: newProfilePublicProfileArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(`✨ ${DEFAULT_AMA_PROMPT}`)).toBeVisible();
    await expect(
      canvas.queryByText("Public Answers & Confessions")
    ).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { isLoadingAnswers: true, isLoadingSuggestions: true, suggestions: [] },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
