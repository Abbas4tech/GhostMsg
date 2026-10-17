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
          aiIdeas: profile.aiIdeas,
          isSuggesting: profile.isSuggesting,
          onChange: profile.setAmaPrompt,
          onShowBannerChange: profile.setShowAmaBanner,
          onSuggest: profile.handleSuggest,
          showBanner: profile.showAmaBanner,
          value: profile.amaPrompt,
        }}
        identity={{
          avatarUrl: profile.avatarUrl,
          displayName: profile.displayName,
          isPhotoProcessing: profile.isPhotoProcessing,
          linkPrefix: profile.linkPrefix,
          onChangeUsername: rename.open,
          onDisplayNameChange: profile.setDisplayName,
          onPhotoRemove: profile.handlePhotoRemove,
          onPhotoSelect: profile.handlePhotoSelect,
          username: profile.username,
        }}
        isAccepting={profile.isAccepting}
        link={{
          onCopy: profile.handleCopyProfileUrl,
          onShare: profile.handleShareProfileUrl,
          profileUrl: profile.profileUrl,
        }}
        unsaved={{
          isSaving: profile.isSaving,
          isVisible: profile.isDirty,
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
