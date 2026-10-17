import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor } from "storybook/test";
import { DEFAULT_AMA_PROMPT } from "@/components/patterns/ama-banner";
import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
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

const SEND_REGEX = /^send anonymously$/i;
const MESSAGE = "You always make the team calls more fun. Thanks!";

const meta = {
  args: defaultPublicProfilePageArgs,
  argTypes: {
    autoFetchSuggestions: {
      control: "boolean",
      description: "Fetch AI suggestions on mount",
    },
    username: { control: "text", description: "Route param `/u/[username]`" },
  },
  component: PublicProfilePage,
  parameters: {
    layout: "fullscreen",
    msw: { handlers: publicProfileHandlers.default },
    pageProviders: true,
  },
  tags: ["autodocs"],
  title: "Pages/PublicProfile",
} satisfies Meta<typeof PublicProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(FIXTURE_AMA_PROMPT, undefined, PAGE_LOAD)
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
    const [, suggestion] = suggestionScenarios.default;
    await userEvent.click(
      await canvas.findByRole("button", { name: suggestion }, PAGE_LOAD)
    );
    await expect(canvas.getByLabelText("Your Anonymous Message")).toHaveValue(
      suggestion
    );
  },
};

export const SendsMessage: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText("Your Anonymous Message"),
      MESSAGE
    );
    await userEvent.click(canvas.getByRole("button", { name: SEND_REGEX }));
    await expect(
      await canvas.findByText(
        `Sent. ${FIXTURE_USERNAME} will never know it was you.`,
        undefined,
        PAGE_LOAD
      )
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Send another" }));
    await waitFor(() =>
      expect(canvas.getByLabelText("Your Anonymous Message")).toHaveValue("")
    );
  },
};

export const NotAcceptingMessages: Story = {
  parameters: { msw: { handlers: publicProfileHandlers.notAccepting } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByLabelText("Your Anonymous Message"),
      MESSAGE
    );
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
      await canvas.findByText(DEFAULT_AMA_PROMPT, undefined, PAGE_LOAD)
    ).toBeVisible();
    await expect(
      canvas.queryByRole("heading", { name: "Public Q&A" })
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

export const Paused: Story = {
  parameters: { msw: { handlers: publicProfileHandlers.paused } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(
        `${FIXTURE_USERNAME} is taking a breather.`,
        undefined,
        PAGE_LOAD
      )
    ).toBeVisible();
  },
};

export const UserNotFound: Story = {
  parameters: { msw: { handlers: publicProfileHandlers.userNotFound } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(
        "Nobody's home at this link.",
        undefined,
        PAGE_LOAD
      )
    ).toBeVisible();
  },
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(FIXTURE_AMA_PROMPT, undefined, PAGE_LOAD)
    ).toBeVisible();
  },
};
