import { FIXTURE_AMA_PROMPT } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import {
  AMA_PROMPT_MAX_LENGTH,
  type AmaPromptEditorProps,
} from "./ama-prompt-editor";

export const defaultAmaPromptEditorArgs: AmaPromptEditorProps = {
  value: FIXTURE_AMA_PROMPT,
  isSaving: false,
  onChange: noop,
  onSave: noop,
};

export const atLimitAmaPromptEditorArgs = {
  value: "x".repeat(AMA_PROMPT_MAX_LENGTH),
} satisfies Partial<AmaPromptEditorProps>;
