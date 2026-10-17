import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
} from "@/mock/fixtures/public-profile.fixtures";
import { noop } from "@/mock/noop";
import type { ProfilePanelProps } from "./profile-panel";

export const defaultProfilePanelArgs: ProfilePanelProps = {
  ama: {
    aiIdeas: [],
    isSuggesting: false,
    onChange: noop,
    onShowBannerChange: noop,
    onSuggest: noop,
    showBanner: true,
    value: FIXTURE_AMA_PROMPT,
  },
  identity: {
    avatarUrl: null,
    displayName: "John Doe",
    isPhotoProcessing: false,
    linkPrefix: "ghostmsg.app/u/",
    onChangeUsername: noop,
    onDisplayNameChange: noop,
    onPhotoRemove: noop,
    onPhotoSelect: noop,
    username: FIXTURE_USERNAME,
  },
  isAccepting: true,
  link: {
    onCopy: noop,
    onShare: noop,
    profileUrl: `https://ghostmsg.app/u/${FIXTURE_USERNAME}`,
  },
  unsaved: {
    isSaving: false,
    isVisible: false,
    onDiscard: noop,
    onSave: noop,
  },
};

export const dirtyProfilePanelArgs = {
  unsaved: { ...defaultProfilePanelArgs.unsaved, isVisible: true },
} satisfies Partial<ProfilePanelProps>;
