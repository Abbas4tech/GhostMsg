import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
} from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { ProfilePanelProps } from "./profile-panel";

export const defaultProfilePanelArgs: ProfilePanelProps = {
  identity: {
    username: FIXTURE_USERNAME,
    displayName: "John Doe",
    avatarUrl: null,
    linkPrefix: "ghostmsg.app/u/",
    isPhotoProcessing: false,
    onChangeUsername: noop,
    onDisplayNameChange: noop,
    onPhotoRemove: noop,
    onPhotoSelect: noop,
  },
  link: {
    profileUrl: `https://ghostmsg.app/u/${FIXTURE_USERNAME}`,
    onCopy: noop,
    onShare: noop,
  },
  ama: {
    value: FIXTURE_AMA_PROMPT,
    showBanner: true,
    aiIdeas: [],
    isSuggesting: false,
    onChange: noop,
    onShowBannerChange: noop,
    onSuggest: noop,
  },
  isAccepting: true,
  unsaved: {
    isVisible: false,
    isSaving: false,
    onDiscard: noop,
    onSave: noop,
  },
};

export const dirtyProfilePanelArgs = {
  unsaved: { ...defaultProfilePanelArgs.unsaved, isVisible: true },
} satisfies Partial<ProfilePanelProps>;
