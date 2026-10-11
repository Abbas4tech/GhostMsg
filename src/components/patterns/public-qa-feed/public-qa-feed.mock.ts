import {
  FIXTURE_USERNAME,
  publicAnswerScenarios,
} from "@/mock/fixtures/public-profile.fixtures";
import type { PublicQaFeedProps } from "./public-qa-feed";

export const defaultPublicQaFeedArgs: PublicQaFeedProps = {
  username: FIXTURE_USERNAME,
  answers: publicAnswerScenarios.some,
  isLoading: false,
};

export const emptyPublicQaFeedArgs = {
  answers: publicAnswerScenarios.none,
} satisfies Partial<PublicQaFeedProps>;

export const longReplyPublicQaFeedArgs = {
  answers: publicAnswerScenarios.longReply,
} satisfies Partial<PublicQaFeedProps>;
