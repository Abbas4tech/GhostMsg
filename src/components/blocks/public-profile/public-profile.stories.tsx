import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type React from "react";
import { useForm } from "react-hook-form";
import { expect, fn } from "storybook/test";
import { DEFAULT_AMA_PROMPT } from "@/components/patterns/ama-banner";
import type { SendMessageValues } from "@/components/patterns/send-message-form";
import {
  FIXTURE_AMA_PROMPT,
  suggestionScenarios,
} from "@/mock/fixtures/public-profile.fixtures";
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
      isAccepting={args.isAccepting}
      isNotFound={args.isNotFound}
      sendForm={{
        form,
        isSent: args.isSent,
        isSubmitting: args.isSubmitting,
        onSendAnother: args.onSendAnother,
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
  parameters: { layout: "fullscreen" },
  args: {
    ...defaultPublicProfileArgs,
    onRefreshSuggestions: fn(),
    onSelectSuggestion: fn(),
    onSendAnother: fn(),
    onSubmit: fn(),
  },
  argTypes: {
    username: { control: "text", description: "Recipient handle" },
    amaPrompt: {
      control: "text",
      description: "AMA Prompt (null → default prompt)",
    },
    answers: { control: "object", description: "Published Q&A" },
    suggestions: { control: "object", description: "Suggested Messages" },
    isAccepting: { control: "boolean", description: "Message Acceptance" },
    isNotFound: { control: "boolean", description: "Unknown username" },
    isSent: { control: "boolean", description: "Just sent a message" },
    isLoadingAnswers: { control: "boolean", description: "Q&A skeleton" },
    isLoadingSuggestions: {
      control: "boolean",
      description: "Suggestions loading",
    },
    isSubmitting: { control: "boolean", description: "Send pending" },
    onSubmit: { description: "Valid message submitted" },
    onSelectSuggestion: {
      description: "Suggestion tapped (page writes it into the form)",
    },
    onRefreshSuggestions: { description: "New ideas clicked" },
    onSendAnother: { description: "Send another clicked" },
  },
} satisfies Meta<typeof PublicProfileHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accepting: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "johndoe" })
    ).toBeVisible();
    await expect(
      canvas.getByText("Accepting Anonymous Messages")
    ).toBeVisible();
    await expect(canvas.getByText(FIXTURE_AMA_PROMPT)).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "Public Q&A" })
    ).toBeVisible();
    const suggestion = suggestionScenarios.default[2];
    await userEvent.click(canvas.getByRole("button", { name: suggestion }));
    await expect(args.onSelectSuggestion).toHaveBeenCalledWith(suggestion);
    await expect(
      canvas.getByRole("button", { name: "Send anonymously" })
    ).toBeDisabled();
  },
};

export const Sent: Story = {
  args: { isSent: true },
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByText("Sent. johndoe will never know it was you.")
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Send another" }));
    await expect(args.onSendAnother).toHaveBeenCalledOnce();
  },
};

export const Paused: Story = {
  args: { isAccepting: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Messages paused")).toBeVisible();
    await expect(
      canvas.getByText("johndoe is taking a breather.")
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Sending is paused" })
    ).toBeDisabled();
    await expect(
      canvas.queryByRole("form", { name: "Send an Anonymous Message" })
    ).not.toBeInTheDocument();
  },
};

export const NotFound: Story = {
  args: { isNotFound: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Nobody's home at this link." })
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Claim /u/johndoe" })
    ).toHaveAttribute("href", "/sign-up?username=johndoe");
  },
};

export const NewProfile: Story = {
  args: newProfilePublicProfileArgs,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(DEFAULT_AMA_PROMPT)).toBeVisible();
    await expect(
      canvas.queryByRole("heading", { name: "Public Q&A" })
    ).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { isLoadingAnswers: true, isLoadingSuggestions: true, suggestions: [] },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
