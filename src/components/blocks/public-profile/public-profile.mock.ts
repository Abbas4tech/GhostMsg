import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
  publicAnswerScenarios,
  suggestionScenarios,
} from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";

/**
 * Args for the PublicProfile story harness (the block needs a react-hook-form
 * instance, which the harness creates; see the stories file).
 */
export interface PublicProfileStoryArgs {
  amaPrompt?: string | null;
  answers: typeof publicAnswerScenarios.some;
  isAccepting: boolean;
  isLoadingAnswers: boolean;
  isLoadingSuggestions: boolean;
  isNotFound: boolean;
  isSent: boolean;
  isSubmitting: boolean;
  onRefreshSuggestions: () => void;
  onSelectSuggestion: (suggestion: string) => void;
  onSendAnother: () => void;
  onSubmit: (values: { content: string }) => void;
  /** The message just sent ("You sent" on the Sent screen). */
  sentContent: string | null;
  suggestions: string[];
  username: string;
}

export const defaultPublicProfileArgs: PublicProfileStoryArgs = {
  amaPrompt: FIXTURE_AMA_PROMPT,
  answers: publicAnswerScenarios.some,
  isAccepting: true,
  isLoadingAnswers: false,
  isLoadingSuggestions: false,
  isNotFound: false,
  isSent: false,
  isSubmitting: false,
  onRefreshSuggestions: noop,
  onSelectSuggestion: noop,
  onSendAnother: noop,
  onSubmit: noop,
  sentContent: null,
  suggestions: suggestionScenarios.default,
  username: FIXTURE_USERNAME,
};

/** Design MobPublicSent. */
export const sentPublicProfileArgs = {
  isSent: true,
  sentContent: "Your newsletter is the only one I read start to finish.",
} satisfies Partial<PublicProfileStoryArgs>;

export const newProfilePublicProfileArgs = {
  amaPrompt: null,
  answers: publicAnswerScenarios.none,
} satisfies Partial<PublicProfileStoryArgs>;
