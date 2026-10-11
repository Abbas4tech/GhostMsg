import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";

export const VALID_MESSAGE = "You always make the team calls more fun. Thanks!";
export const TOO_SHORT_MESSAGE = "Short";

export interface SendMessageFormStoryArgs {
  defaultContent: string;
  isSubmitting: boolean;
  onSubmit: (values: { content: string }) => void;
  username: string;
}

export const defaultSendMessageFormArgs: SendMessageFormStoryArgs = {
  username: FIXTURE_USERNAME,
  defaultContent: "",
  isSubmitting: false,
  onSubmit: noop,
};
