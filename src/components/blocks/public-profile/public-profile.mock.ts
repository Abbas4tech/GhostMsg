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
  suggestions: suggestionScenarios.default,
  username: FIXTURE_USERNAME,
};

export const newProfilePublicProfileArgs = {
  amaPrompt: null,
  answers: publicAnswerScenarios.none,
} satisfies Partial<PublicProfileStoryArgs>;
