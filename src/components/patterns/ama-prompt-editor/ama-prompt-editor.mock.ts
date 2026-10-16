import { FIXTURE_AMA_PROMPT } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import {
  AMA_PROMPT_MAX_LENGTH,
  type AmaPromptEditorProps,
} from "./ama-prompt-editor";

export const defaultAmaPromptEditorArgs: AmaPromptEditorProps = {
  aiIdeas: [],
  isSuggesting: false,
  onChange: noop,
  onShowBannerChange: noop,
  onSuggest: noop,
  showBanner: true,
  value: FIXTURE_AMA_PROMPT,
};

export const aiIdeasAmaPromptEditorArgs = {
  aiIdeas: ["What should I build next?", "Roast my portfolio"],
} satisfies Partial<AmaPromptEditorProps>;

export const atLimitAmaPromptEditorArgs = {
  value: "x".repeat(AMA_PROMPT_MAX_LENGTH),
} satisfies Partial<AmaPromptEditorProps>;
