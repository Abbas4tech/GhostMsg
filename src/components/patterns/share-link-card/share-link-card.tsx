"use client";

import { CopyIcon, Link2Icon, ShareIcon } from "lucide-react";
import type React from "react";
import { useId } from "react";
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
import { cn } from "@/lib/utils";

export interface ShareLinkCardProps {
  /**
   * "default": the link in a pill field with inline Copy (desktop).
   * "compact": phones (design MobProfile), overline label, the link as a
   * heading, then Copy and Share… side by side.
   */
  layout?: "compact" | "default";
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
  layout = "default",
}: ShareLinkCardProps): React.JSX.Element {
  const titleId = useId();

  if (layout === "compact") {
    return (
      <Card
        aria-labelledby={titleId}
        className="gap-3 p-4"
        data-slot="share-link-card"
        role="region"
        variant="elevated"
      >
        <h2
          className="text-muted-foreground text-overline uppercase"
          id={titleId}
        >
          Your Public Profile Link
        </h2>
        <p className="break-all text-h3">{withoutProtocol(profileUrl)}</p>
        <div className={cn("grid gap-2", onShare && "grid-cols-2")}>
          <Button className="h-11 rounded-full" onClick={onCopy}>
            <CopyIcon data-icon="inline-start" />
            Copy
          </Button>
          {onShare ? (
            <Button
              className="h-11 rounded-full"
              onClick={onShare}
              variant="secondary"
            >
              <ShareIcon data-icon="inline-start" />
              Share…
            </Button>
          ) : null}
        </div>
        <p className="text-muted-foreground text-xs">
          Put it in your Instagram or Snapchat bio.
        </p>
      </Card>
    );
  }

  return (
    <Card data-slot="share-link-card" variant="elevated">
      <CardHeader>
        <CardTitle>
          <h2 className="text-h3">Your Public Profile Link</h2>
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
              <ShareIcon data-icon="inline-start" />
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
