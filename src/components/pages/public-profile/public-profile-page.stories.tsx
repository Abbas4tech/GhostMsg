import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor } from "storybook/test";
import { DEFAULT_AMA_PROMPT } from "@/components/patterns/ama-banner";
import {
  FIXTURE_AMA_PROMPT,
  publicAnswerScenarios,
  suggestionScenarios,
} from "@/mock/fixtures/public-profile.fixtures";
import { PublicProfilePage } from "./public-profile-page";
import {
  defaultPublicProfilePageArgs,
  publicProfileHandlers,
} from "./public-profile-page.mock";

/** Page stories chain MSW worker start → session → lazy chunk → query; allow realistic load time under parallel runs. */
const PAGE_LOAD = { timeout: 15_000 };

const TEXTAREA_REGEX = /type your message here/i;
const SEND_REGEX = /^send$/i;
const MESSAGE = "You always make the team calls more fun. Thanks!";

const meta = {
  title: "Pages/PublicProfile",
  component: PublicProfilePage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    pageProviders: true,
    msw: { handlers: publicProfileHandlers.default },
  },
  args: defaultPublicProfilePageArgs,
  argTypes: {
    username: { control: "text", description: "Route param `/u/[username]`" },
    autoFetchSuggestions: {
      control: "boolean",
      description: "Fetch AI suggestions on mount",
    },
  },
} satisfies Meta<typeof PublicProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(`✨ ${FIXTURE_AMA_PROMPT}`, undefined, PAGE_LOAD)
    ).toBeVisible();
    await expect(
      await canvas.findByText(
        publicAnswerScenarios.some[0].reply.text,
        undefined,
        PAGE_LOAD
      )
    ).toBeVisible();
    await expect(
      await canvas.findByRole("button", {
        name: suggestionScenarios.default[0],
      })
    ).toBeVisible();
  },
};

export const SuggestionFillsForm: Story = {
  play: async ({ canvas, userEvent }) => {
    const suggestion = suggestionScenarios.default[1];
    await userEvent.click(
      await canvas.findByRole("button", { name: suggestion }, PAGE_LOAD)
    );
    await expect(canvas.getByPlaceholderText(TEXTAREA_REGEX)).toHaveValue(
      suggestion
    );
  },
};

export const SendsMessage: Story = {
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByPlaceholderText(TEXTAREA_REGEX);
    await userEvent.type(textarea, MESSAGE);
    await userEvent.click(canvas.getByRole("button", { name: SEND_REGEX }));
    await expect(
      await screen.findByText("Message sent successfully", undefined, PAGE_LOAD)
    ).toBeVisible();
    await waitFor(() => expect(textarea).toHaveValue(""));
  },
};

export const NotAcceptingMessages: Story = {
  parameters: { msw: { handlers: publicProfileHandlers.notAccepting } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByPlaceholderText(TEXTAREA_REGEX), MESSAGE);
    await userEvent.click(canvas.getByRole("button", { name: SEND_REGEX }));
    await expect(
      await screen.findByText(
        "User is not accepting messages right now",
        undefined,
        PAGE_LOAD
      )
    ).toBeVisible();
  },
};

export const NoAnswersYet: Story = {
  parameters: { msw: { handlers: publicProfileHandlers.noAnswers } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(`✨ ${DEFAULT_AMA_PROMPT}`, undefined, PAGE_LOAD)
    ).toBeVisible();
    await expect(
      canvas.queryByText("Public Answers & Confessions")
    ).not.toBeInTheDocument();
  },
};

export const AnswersLoading: Story = {
  parameters: { msw: { handlers: publicProfileHandlers.answersLoading } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole(
        "status",
        { name: "Loading public answers" },
        PAGE_LOAD
      )
    ).toBeVisible();
  },
};

export const SuggestionsUnavailable: Story = {
  parameters: { msw: { handlers: publicProfileHandlers.suggestionsError } },
  play: async () => {
    await expect(
      await screen.findByText(
        "AI suggestions are unavailable",
        undefined,
        PAGE_LOAD
      )
    ).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(`✨ ${FIXTURE_AMA_PROMPT}`, undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};
