import type { PublicAnswerDto } from "@/types/api";
import { fixtureDate } from "./messages.fixtures";

/** Public Q&A item exactly as `GET /api/public/{username}/answers` returns it. */
export type PublicAnswerFixture = PublicAnswerDto;

export const FIXTURE_USERNAME = "johndoe";
export const FIXTURE_AMA_PROMPT =
  "Ask me anything about tech, design, or life!";

export function buildPublicAnswer(
  overrides: Partial<PublicAnswerFixture> = {}
): PublicAnswerFixture {
  return {
    _id: "qa-1",
    content: "What's your favourite design tool?",
    sentimentTag: "curious",
    createdAt: fixtureDate(30),
    reply: {
      text: "Pen and paper first, then Figma.",
      publishedAt: fixtureDate(29),
    },
    ...overrides,
  };
}

export const publicAnswerScenarios = {
  some: [
    buildPublicAnswer(),
    buildPublicAnswer({
      _id: "qa-2",
      content: "You always make my day better!",
      sentimentTag: "sweet",
      createdAt: fixtureDate(54),
      reply: { text: "That honestly means a lot. Thank you!" },
    }),
    buildPublicAnswer({
      _id: "qa-3",
      content: "Roast my portfolio in one sentence.",
      sentimentTag: "spicy",
      createdAt: fixtureDate(80),
      reply: { text: "Great work, terrible font choices." },
    }),
  ],
  none: [] as PublicAnswerFixture[],
  longReply: [
    buildPublicAnswer({
      _id: "qa-long",
      reply: {
        text: "A thoughtful, very long answer that wraps across many lines to check typography and spacing. ".repeat(
          4
        ),
      },
    }),
  ],
} satisfies Record<string, PublicAnswerFixture[]>;

/** AI suggestion prompts (the API joins them with `||`). */
export const suggestionScenarios = {
  default: [
    "What's a hobby you've recently started?",
    "If you could have dinner with any historical figure, who would it be?",
    "What's a simple thing that makes you happy?",
  ],
  none: [] as string[],
  long: [
    "If you could instantly master any skill, but only use it on weekends, which skill would you choose and why would weekends be enough?",
  ],
};

export const joinSuggestions = (items: string[]): string => items.join("||");
