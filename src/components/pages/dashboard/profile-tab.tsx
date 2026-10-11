"use client";

import type React from "react";
import { ProfilePanel } from "@/components/blocks/profile-panel";
import { useProfileController } from "./use-profile.controller";

export function ProfileTab(): React.JSX.Element {
  const profile = useProfileController();

  return (
    <ProfilePanel
      amaPrompt={profile.amaPrompt}
      isSavingAmaPrompt={profile.isSavingAmaPrompt}
      onAmaPromptChange={profile.setAmaPrompt}
      onCopyProfileUrl={profile.handleCopyProfileUrl}
      onSaveAmaPrompt={profile.handleSaveAmaPrompt}
      profileUrl={profile.profileUrl}
    />
  );
}

export default ProfileTab;
