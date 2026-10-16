import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
} from "@/mock/fixtures/public-profile.fixtures";
import type { VisitorPreviewProps } from "./visitor-preview";

export const defaultVisitorPreviewArgs: VisitorPreviewProps = {
  username: FIXTURE_USERNAME,
  displayName: "John",
  avatarUrl: null,
  amaPrompt: FIXTURE_AMA_PROMPT,
  showAmaBanner: true,
  isAccepting: true,
};
