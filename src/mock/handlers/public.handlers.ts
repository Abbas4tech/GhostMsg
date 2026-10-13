import { http } from "msw";
import {
  FIXTURE_AMA_PROMPT,
  joinSuggestions,
  type PublicAnswerFixture,
  publicAnswerScenarios,
  suggestionScenarios,
} from "@/mock/fixtures/public-profile.fixtures";
import {
  apiError,
  applyLatency,
  mswPath,
  ok,
  type ScenarioOptions,
} from "./utils";

/** `/u/[username]` answers feed + AMA prompt. */
export const publicAnswersHandlers = (
  answers: PublicAnswerFixture[],
  amaPrompt: string | undefined = FIXTURE_AMA_PROMPT,
  options: ScenarioOptions & { isAcceptingMessages?: boolean } = {}
) => [
  http.get(mswPath("/api/public/{username}/answers"), async ({ params }) => {
    await applyLatency(options);
    return ok("/api/public/{username}/answers", "get", {
      success: true,
      username: String(params.username),
      amaPrompt,
      isAcceptingMessages: options.isAcceptingMessages ?? true,
      answers,
    });
  }),
];

export const sendMessageHandlers = {
  success: [
    http.post(mswPath("/api/send-message"), () =>
      ok("/api/send-message", "post", {
        success: true,
        message: "Message sent successfully",
      })
    ),
  ],
  notAccepting: [
    http.post(mswPath("/api/send-message"), () =>
      apiError(403, "User is not accepting messages right now")
    ),
  ],
};

/** AI endpoints: suggestions (public profile) and smart reply (inbox). */
export const aiHandlers = (
  suggestions: string[] = suggestionScenarios.default,
  options: ScenarioOptions = {}
) => [
  http.get(mswPath("/api/suggest-messages"), async () => {
    await applyLatency(options);
    return ok("/api/suggest-messages", "get", {
      success: true,
      messages: joinSuggestions(suggestions),
    });
  }),
  http.post(mswPath("/api/ai/smart-reply"), () =>
    ok("/api/ai/smart-reply", "post", {
      success: true,
      reply: "Thanks for the kind words. You just made my day!",
    })
  ),
];

export const publicHandlers = {
  answers: {
    some: publicAnswersHandlers(publicAnswerScenarios.some),
    none: publicAnswersHandlers(publicAnswerScenarios.none, undefined),
    paused: publicAnswersHandlers(
      publicAnswerScenarios.some,
      FIXTURE_AMA_PROMPT,
      {
        isAcceptingMessages: false,
      }
    ),
    loading: publicAnswersHandlers(
      publicAnswerScenarios.some,
      FIXTURE_AMA_PROMPT,
      {
        latency: "infinite",
      }
    ),
    error: [
      http.get(mswPath("/api/public/{username}/answers"), () =>
        apiError(404, "User not found")
      ),
    ],
  },
  send: sendMessageHandlers,
  ai: {
    default: aiHandlers(),
    none: aiHandlers(suggestionScenarios.none),
    loading: aiHandlers(suggestionScenarios.default, { latency: "infinite" }),
    error: [
      http.get(mswPath("/api/suggest-messages"), () =>
        apiError(500, "AI suggestions are unavailable")
      ),
    ],
  },
};
