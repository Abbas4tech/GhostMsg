"use client";

import { CopyIcon, Link2Icon, Share2Icon } from "lucide-react";
import type React from "react";
import { Button } from "@/components/elements/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/elements/input-group";

export interface ShareLinkCardProps {
  /** Copy clicked (the page writes the clipboard and toasts). */
  onCopy?: () => void;
  /** Native share sheet (hidden when not provided). */
  onShare?: () => void;
  profileUrl: string;
}

const PROTOCOL_PATTERN = /^https?:\/\//;

const withoutProtocol = (url: string): string =>
  url.replace(PROTOCOL_PATTERN, "");

/** The Public Profile Link with Copy and the native Share sheet. */
export function ShareLinkCard({
  profileUrl,
  onCopy,
  onShare,
}: ShareLinkCardProps): React.JSX.Element {
  return (
    <Card data-slot="share-link-card" variant="elevated">
      <CardHeader>
        <CardTitle>
          <h2 className="font-bold text-xl">Your Public Profile Link</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <InputGroup className="h-14" shape="pill" size="lg">
          <InputGroupAddon>
            <Link2Icon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Your profile link"
            className="font-semibold"
            readOnly
            value={withoutProtocol(profileUrl)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              className="rounded-full"
              onClick={onCopy}
              size="sm"
              variant="default"
            >
              <CopyIcon data-icon="inline-start" />
              Copy
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {onShare ? (
          <div>
            <Button
              className="rounded-full"
              onClick={onShare}
              size="sm"
              variant="secondary"
            >
              <Share2Icon data-icon="inline-start" />
              Share…
            </Button>
          </div>
        ) : null}
        <CardDescription>
          Paste it in your Instagram or Snapchat bio. Senders never sign in.
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export default ShareLinkCard;
