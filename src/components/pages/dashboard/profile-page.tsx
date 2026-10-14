"use client";

import type React from "react";
import { ProfilePanel } from "@/components/blocks/profile-panel";
import {
  ChangeUsernameModal,
  DiscardChangesModal,
} from "@/components/patterns/modals";
import { useChangeUsernameController } from "./use-change-username.controller";
import { useProfileController } from "./use-profile.controller";

/** /dashboard/profile: identity, link, AMA Prompt, live preview, leave guard. */
export function ProfilePage(): React.JSX.Element {
  const profile = useProfileController();
  const rename = useChangeUsernameController(profile.username);

  return (
    <>
      <ProfilePanel
        ama={{
          value: profile.amaPrompt,
          onChange: profile.setAmaPrompt,
          aiIdeas: profile.aiIdeas,
          onSuggest: profile.handleSuggest,
          isSuggesting: profile.isSuggesting,
          showBanner: profile.showAmaBanner,
          onShowBannerChange: profile.setShowAmaBanner,
        }}
        identity={{
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          linkPrefix: profile.linkPrefix,
          isPhotoProcessing: profile.isPhotoProcessing,
          onDisplayNameChange: profile.setDisplayName,
          onPhotoSelect: profile.handlePhotoSelect,
          onPhotoRemove: profile.handlePhotoRemove,
          onChangeUsername: rename.open,
        }}
        isAccepting={profile.isAccepting}
        link={{
          profileUrl: profile.profileUrl,
          onCopy: profile.handleCopyProfileUrl,
          onShare: profile.handleShareProfileUrl,
        }}
        unsaved={{
          isVisible: profile.isDirty,
          isSaving: profile.isSaving,
          onDiscard: profile.handleDiscard,
          onSave: profile.handleSave,
        }}
      />
      <ChangeUsernameModal
        availability={rename.availability}
        errorMessage={rename.errorMessage}
        isSaving={rename.isSaving}
        linkPrefix={profile.linkPrefix}
        onOpenChange={rename.setIsOpen}
        onSubmit={rename.handleSubmit}
        onValueChange={rename.setValue}
        open={rename.isOpen}
        value={rename.value}
      />
      <DiscardChangesModal
        onDiscard={profile.handleConfirmLeave}
        onKeepEditing={profile.handleCancelLeave}
        open={profile.isLeaveConfirmOpen}
      />
    </>
  );
}

export default ProfilePage;
