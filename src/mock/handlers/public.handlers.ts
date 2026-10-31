import { http } from "msw";
import { smartReplyDrafts } from "@/mock/fixtures/messages.fixtures";
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
      amaPrompt,
      answers,
      isAcceptingMessages: options.isAcceptingMessages ?? true,
      success: true,
      username: String(params.username),
    });
  }),
];

export const sendMessageHandlers = {
  notAccepting: [
    http.post(mswPath("/api/send-message"), () =>
      apiError(403, "User is not accepting messages right now")
    ),
  ],
  success: [
    http.post(mswPath("/api/send-message"), () =>
      ok("/api/send-message", "post", {
        message: "Message sent successfully",
        success: true,
      })
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
      messages: joinSuggestions(suggestions),
      success: true,
    });
  }),
  http.post(mswPath("/api/ai/smart-reply"), async () => {
    await applyLatency(options);
    return ok("/api/ai/smart-reply", "post", {
      drafts: smartReplyDrafts,
      success: true,
    });
  }),
];

export const publicHandlers = {
  ai: {
    default: aiHandlers(),
    error: [
      http.get(mswPath("/api/suggest-messages"), () =>
        apiError(500, "AI suggestions are unavailable")
      ),
    ],
    loading: aiHandlers(suggestionScenarios.default, { latency: "infinite" }),
    none: aiHandlers(suggestionScenarios.none),
    smartReplyError: [
      http.post(mswPath("/api/ai/smart-reply"), () =>
        apiError(500, "Smart Reply is unavailable")
      ),
    ],
  },
  answers: {
    error: [
      http.get(mswPath("/api/public/{username}/answers"), () =>
        apiError(404, "User not found")
      ),
    ],
    loading: publicAnswersHandlers(
      publicAnswerScenarios.some,
      FIXTURE_AMA_PROMPT,
      {
        latency: "infinite",
      }
    ),
    none: publicAnswersHandlers(publicAnswerScenarios.none, undefined),
    paused: publicAnswersHandlers(
      publicAnswerScenarios.some,
      FIXTURE_AMA_PROMPT,
      {
        isAcceptingMessages: false,
      }
    ),
    some: publicAnswersHandlers(publicAnswerScenarios.some),
  },
  send: sendMessageHandlers,
};
