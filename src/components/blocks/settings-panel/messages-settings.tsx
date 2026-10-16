"use client";

import type React from "react";
import { Badge } from "@/components/elements/badge";
import {
  SettingsDivider,
  SettingsSection,
  SwitchSetting,
} from "./settings-section";

export interface MessagesSettingsProps {
  isAcceptancePending?: boolean;
  isAccepting: boolean;
  offerSuggestions: boolean;
  onOfferSuggestionsChange: (value: boolean) => void;
  onPublishByDefaultChange: (value: boolean) => void;
  onToggleAcceptance: () => void;
  publishByDefault: boolean;
}

/** Message Acceptance, Suggested Messages and publish-by-default. */
export function MessagesSettings({
  isAccepting,
  isAcceptancePending = false,
  onToggleAcceptance,
  offerSuggestions,
  onOfferSuggestionsChange,
  publishByDefault,
  onPublishByDefaultChange,
}: MessagesSettingsProps): React.JSX.Element {
  return (
    <SettingsSection id="messages" title="Messages">
      <SwitchSetting
        badge={
          isAccepting ? (
            <Badge variant="success">Accepting</Badge>
          ) : (
            <Badge variant="neutral">Paused</Badge>
          )
        }
        checked={isAccepting}
        description="Turn off to pause new Anonymous Messages. Your link stays up and says you're taking a breather."
        disabled={isAcceptancePending}
        onCheckedChange={onToggleAcceptance}
        title="Message Acceptance"
      />
      <SettingsDivider />
      <SwitchSetting
        checked={offerSuggestions}
        description="AI prompts that help senders start writing."
        onCheckedChange={onOfferSuggestionsChange}
        title="Offer Suggested Messages to visitors"
      />
      <SettingsDivider />
      <SwitchSetting
        checked={publishByDefault}
        description="You can still choose per answer in Smart Reply."
        onCheckedChange={onPublishByDefaultChange}
        title="Publish answers to my Public Q&A by default"
      />
    </SettingsSection>
  );
}
