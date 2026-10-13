import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
  publicAnswerScenarios,
  suggestionScenarios,
} from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";

/**
 * Args for the PublicProfile story harness (the block needs a react-hook-form
 * instance, which the harness creates — see the stories file).
 */
export interface PublicProfileStoryArgs {
  amaPrompt?: string | null;
  answers: typeof publicAnswerScenarios.some;
  isLoadingAnswers: boolean;
  isLoadingSuggestions: boolean;
  isSubmitting: boolean;
  onRefreshSuggestions: () => void;
  onSelectSuggestion: (suggestion: string) => void;
  onSubmit: (values: { content: string }) => void;
  suggestions: string[];
  username: string;
}

export const defaultPublicProfileArgs: PublicProfileStoryArgs = {
  username: FIXTURE_USERNAME,
  amaPrompt: FIXTURE_AMA_PROMPT,
  answers: publicAnswerScenarios.some,
  suggestions: suggestionScenarios.default,
  isLoadingAnswers: false,
  isLoadingSuggestions: false,
  isSubmitting: false,
  onRefreshSuggestions: noop,
  onSelectSuggestion: noop,
  onSubmit: noop,
};

export const newProfilePublicProfileArgs = {
  amaPrompt: null,
  answers: publicAnswerScenarios.none,
} satisfies Partial<PublicProfileStoryArgs>;
