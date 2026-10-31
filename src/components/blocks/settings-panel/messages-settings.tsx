"use client";

import { MailIcon } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/elements/badge";
import {
  SettingsDivider,
  SettingsSection,
  SwitchSetting,
  useSettingsLayout,
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

/**
 * Message Acceptance, Suggested Messages and publish-by-default. On phones
 * Message Acceptance lives in the account card above, so it's left out here.
 */
export function MessagesSettings({
  isAccepting,
  isAcceptancePending = false,
  onToggleAcceptance,
  offerSuggestions,
  onOfferSuggestionsChange,
  publishByDefault,
  onPublishByDefaultChange,
}: MessagesSettingsProps): React.JSX.Element {
  const showAcceptance = useSettingsLayout() === "cards";

  return (
    <SettingsSection
      icon={<MailIcon />}
      id="messages"
      summary="Suggested Messages, Public Q&A"
      title="Messages"
    >
      {showAcceptance ? (
        <>
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
        </>
      ) : null}
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
