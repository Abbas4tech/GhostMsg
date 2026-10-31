"use client";

import { EyeIcon } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useCallback, useState } from "react";
import { Button } from "@/components/elements/button";
import {
  AmaPromptEditor,
  type AmaPromptEditorProps,
} from "@/components/patterns/ama-prompt-editor";
import {
  IdentityCard,
  type IdentityCardProps,
  IdentitySummary,
} from "@/components/patterns/identity-card";
import { MobileHeaderActions } from "@/components/patterns/mobile-header-actions";
import { PageHeading } from "@/components/patterns/page-heading";
import {
  ShareLinkCard,
  type ShareLinkCardProps,
} from "@/components/patterns/share-link-card";
import {
  UnsavedChangesBar,
  type UnsavedChangesBarProps,
} from "@/components/patterns/unsaved-changes-bar";
import { VisitorPreview } from "@/components/patterns/visitor-preview";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ProfilePanelProps {
  ama: AmaPromptEditorProps;
  identity: IdentityCardProps;
  /** Message Acceptance, for the preview's status line. */
  isAccepting: boolean;
  link: ShareLinkCardProps;
  unsaved: UnsavedChangesBarProps;
}

/**
 * Phones (design MobProfile): identity as a one-row summary; "Edit" opens
 * the full form in place and "Done" folds it back. Drafts stay in the page,
 * so folding never loses an edit.
 */
function PhoneIdentity({
  identity,
}: {
  identity: IdentityCardProps;
}): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);
  const handleDone = useCallback(() => {
    setIsEditing(false);
  }, []);

  return isEditing ? (
    <IdentityCard {...identity} onDone={handleDone} />
  ) : (
    <IdentitySummary
      avatarUrl={identity.avatarUrl}
      displayName={identity.displayName}
      onEdit={handleEdit}
      username={identity.username}
    />
  );
}

/**
 * /dashboard/profile: Identity, link and AMA cards beside a sticky live
 * preview, with the unsaved-changes bar. Phones get the design's stacked
 * layout and "View as visitor" in the top bar. Pure: drafts live in the page.
 */
export function ProfilePanel({
  identity,
  link,
  ama,
  isAccepting,
  unsaved,
}: ProfilePanelProps): React.JSX.Element {
  const isMobile = useIsMobile();
  const visitorHref = `/u/${identity.username}`;

  const preview = (
    <VisitorPreview
      amaPrompt={ama.value}
      avatarUrl={identity.avatarUrl}
      displayName={identity.displayName}
      isAccepting={isAccepting}
      showAmaBanner={ama.showBanner}
      username={identity.username}
    />
  );

  if (isMobile) {
    return (
      <div className="flex min-h-full flex-col gap-4" data-slot="profile-panel">
        <MobileHeaderActions>
          <Button
            asChild
            className="h-11 rounded-full px-3.5 font-semibold"
            variant="ghost"
          >
            <Link href={visitorHref}>
              <EyeIcon data-icon="inline-start" />
              View as visitor
            </Link>
          </Button>
        </MobileHeaderActions>
        <h1 className="text-h1">Profile</h1>
        <PhoneIdentity identity={identity} />
        <ShareLinkCard {...link} layout="compact" />
        <AmaPromptEditor {...ama} />
        {preview}
        <UnsavedChangesBar {...unsaved} />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-5" data-slot="profile-panel">
      <PageHeading
        actions={
          <Button asChild className="rounded-full" variant="outline">
            <Link href={visitorHref}>
              <EyeIcon data-icon="inline-start" />
              View as visitor
            </Link>
          </Button>
        }
        breadcrumb={[
          { href: "/dashboard", label: "Dashboard" },
          { label: "Profile" },
        ]}
        description="This is how you appear to anyone who opens your link."
        title="Profile"
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-start gap-6">
        <div className="flex flex-col gap-5">
          <IdentityCard {...identity} />
          <ShareLinkCard {...link} />
          <AmaPromptEditor {...ama} />
        </div>
        {preview}
      </div>

      <UnsavedChangesBar {...unsaved} />
    </div>
  );
}
