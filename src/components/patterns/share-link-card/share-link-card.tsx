"use client";

import { LinkIcon } from "lucide-react";
import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";
import { CopyButton } from "@/components/elements/copy-button";
import { Input } from "@/components/elements/input";

export interface ShareLinkCardProps {
  onCopy?: () => void;
  profileUrl: string;
}

/** Read-only public profile URL with a copy-to-clipboard button. */
export function ShareLinkCard({
  profileUrl,
  onCopy,
}: ShareLinkCardProps): React.JSX.Element {
  return (
    <Card data-slot="share-link-card">
      <CardHeader>
        <CardTitle>Your Profile Link</CardTitle>
        <CardDescription>
          Share this link on Instagram, Snapchat, WhatsApp, or X to receive
          anonymous messages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            aria-label="Your profile link"
            className="flex-grow"
            disabled
            value={profileUrl}
          />
          <CopyButton content={profileUrl} onClick={onCopy} />
        </div>
        <div className="flex items-center text-muted-foreground text-sm">
          <LinkIcon className="mr-2 h-4 w-4" />
          Anyone with this link can send you anonymous messages without
          registering.
        </div>
      </CardContent>
    </Card>
  );
}

export default ShareLinkCard;
