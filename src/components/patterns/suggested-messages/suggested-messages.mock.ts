import { suggestionScenarios } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { SuggestedMessagesProps } from "./suggested-messages";

export const defaultSuggestedMessagesArgs: SuggestedMessagesProps = {
  isLoading: false,
  onRefresh: noop,
  onSelect: noop,
  suggestions: suggestionScenarios.default,
};

export const emptySuggestedMessagesArgs = {
  suggestions: suggestionScenarios.none,
} satisfies Partial<SuggestedMessagesProps>;

export const longSuggestedMessagesArgs = {
  suggestions: suggestionScenarios.long,
} satisfies Partial<SuggestedMessagesProps>;
