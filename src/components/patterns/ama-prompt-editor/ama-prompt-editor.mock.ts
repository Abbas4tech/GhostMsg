import { FIXTURE_AMA_PROMPT } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import {
  AMA_PROMPT_MAX_LENGTH,
  type AmaPromptEditorProps,
} from "./ama-prompt-editor";

export const defaultAmaPromptEditorArgs: AmaPromptEditorProps = {
  value: FIXTURE_AMA_PROMPT,
  showBanner: true,
  isSuggesting: false,
  aiIdeas: [],
  onChange: noop,
  onShowBannerChange: noop,
  onSuggest: noop,
};

export const aiIdeasAmaPromptEditorArgs = {
  aiIdeas: ["What should I build next?", "Roast my portfolio"],
} satisfies Partial<AmaPromptEditorProps>;

export const atLimitAmaPromptEditorArgs = {
  value: "x".repeat(AMA_PROMPT_MAX_LENGTH),
} satisfies Partial<AmaPromptEditorProps>;
