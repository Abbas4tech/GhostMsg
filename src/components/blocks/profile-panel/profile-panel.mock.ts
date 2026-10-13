import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
} from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { ProfilePanelProps } from "./profile-panel";

export const defaultProfilePanelArgs: ProfilePanelProps = {
  profileUrl: `https://ghostmsg.app/u/${FIXTURE_USERNAME}`,
  amaPrompt: FIXTURE_AMA_PROMPT,
  isSavingAmaPrompt: false,
  onAmaPromptChange: noop,
  onCopyProfileUrl: noop,
  onSaveAmaPrompt: noop,
};
