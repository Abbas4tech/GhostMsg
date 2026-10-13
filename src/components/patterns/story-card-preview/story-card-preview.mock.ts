import { answeredSpicyMessage } from "@/mock/fixtures/messages.fixtures";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import type { StoryCardPreviewProps } from "./story-card-preview";

export const defaultStoryCardPreviewArgs: StoryCardPreviewProps = {
  question: answeredSpicyMessage.content,
  answer: answeredSpicyMessage.reply?.text,
  username: FIXTURE_USERNAME,
  profileLabel: `ghostmsg.app/u/${FIXTURE_USERNAME}`,
  label: "🔥 Spicy",
  size: "md",
  tilt: "none",
};

export const questionOnlyStoryCardPreviewArgs = {
  answer: undefined,
  label: undefined,
} satisfies Partial<StoryCardPreviewProps>;
