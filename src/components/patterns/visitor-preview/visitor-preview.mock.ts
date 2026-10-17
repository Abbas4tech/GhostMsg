import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
} from "@/mock/fixtures/public-profile.fixtures";
import type { VisitorPreviewProps } from "./visitor-preview";

export const defaultVisitorPreviewArgs: VisitorPreviewProps = {
  amaPrompt: FIXTURE_AMA_PROMPT,
  avatarUrl: null,
  displayName: "John",
  isAccepting: true,
  showAmaBanner: true,
  username: FIXTURE_USERNAME,
};
