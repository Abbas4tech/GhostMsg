import { answeredSpicyMessage } from "@/mock/fixtures/messages.fixtures";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import type { StoryCardPreviewProps } from "./story-card-preview";

export const defaultStoryCardPreviewArgs: StoryCardPreviewProps = {
  answer: answeredSpicyMessage.reply?.text,
  label: "🔥 Spicy",
  profileLabel: `ghostmsg.app/u/${FIXTURE_USERNAME}`,
  question: answeredSpicyMessage.content,
  size: "md",
  tilt: "none",
  username: FIXTURE_USERNAME,
};

export const questionOnlyStoryCardPreviewArgs = {
  answer: undefined,
  label: undefined,
} satisfies Partial<StoryCardPreviewProps>;
