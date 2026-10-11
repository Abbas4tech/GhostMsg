import type React from "react";
import { AmaPromptEditor } from "@/components/patterns/ama-prompt-editor";
import { ShareLinkCard } from "@/components/patterns/share-link-card";

export interface ProfilePanelProps {
  amaPrompt: string;
  isSavingAmaPrompt?: boolean;
  onAmaPromptChange: (value: string) => void;
  onCopyProfileUrl?: () => void;
  onSaveAmaPrompt: () => void;
  profileUrl: string;
}

/** Dashboard Profile tab: shareable link + AMA banner editor. */
export function ProfilePanel({
  profileUrl,
  onCopyProfileUrl,
  amaPrompt,
  isSavingAmaPrompt,
  onAmaPromptChange,
  onSaveAmaPrompt,
}: ProfilePanelProps): React.JSX.Element {
  return (
    <div className="space-y-6" data-slot="profile-panel">
      <ShareLinkCard onCopy={onCopyProfileUrl} profileUrl={profileUrl} />
      <AmaPromptEditor
        isSaving={isSavingAmaPrompt}
        onChange={onAmaPromptChange}
        onSave={onSaveAmaPrompt}
        value={amaPrompt}
      />
    </div>
  );
}

export default ProfilePanel;
