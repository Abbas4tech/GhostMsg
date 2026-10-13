import { EyeIcon } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/elements/button";
import {
  AmaPromptEditor,
  type AmaPromptEditorProps,
} from "@/components/patterns/ama-prompt-editor";
import {
  IdentityCard,
  type IdentityCardProps,
} from "@/components/patterns/identity-card";
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

export interface ProfilePanelProps {
  ama: AmaPromptEditorProps;
  identity: IdentityCardProps;
  /** Message Acceptance, for the preview's status line. */
  isAccepting: boolean;
  link: ShareLinkCardProps;
  unsaved: UnsavedChangesBarProps;
}

/**
 * /dashboard/profile: Identity, link and AMA cards beside a sticky live
 * preview, with the unsaved-changes bar. Pure: drafts live in the page.
 */
export function ProfilePanel({
  identity,
  link,
  ama,
  isAccepting,
  unsaved,
}: ProfilePanelProps): React.JSX.Element {
  return (
    <div className="flex min-h-full flex-col gap-5" data-slot="profile-panel">
      <PageHeading
        actions={
          <Button asChild className="rounded-full" variant="outline">
            <Link href={`/u/${identity.username}`}>
              <EyeIcon data-icon="inline-start" />
              View as visitor
            </Link>
          </Button>
        }
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
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
        <VisitorPreview
          amaPrompt={ama.value}
          avatarUrl={identity.avatarUrl}
          displayName={identity.displayName}
          isAccepting={isAccepting}
          showAmaBanner={ama.showBanner}
          username={identity.username}
        />
      </div>

      <UnsavedChangesBar {...unsaved} />
    </div>
  );
}

export default ProfilePanel;
