import { LockIcon } from "lucide-react";
import type React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/elements/avatar";
import { Card, CardContent } from "@/components/elements/card";
import { AmaBanner } from "@/components/patterns/ama-banner";

export interface VisitorPreviewProps {
  amaPrompt: string;
  avatarUrl?: string | null;
  displayName: string;
  isAccepting: boolean;
  showAmaBanner: boolean;
  username: string;
}

/**
 * Live preview of the public profile while editing. Illustrative only: the
 * box and button are not interactive.
 */
export function VisitorPreview({
  username,
  displayName,
  avatarUrl,
  amaPrompt,
  showAmaBanner,
  isAccepting,
}: VisitorPreviewProps): React.JSX.Element {
  const name = displayName.trim() || username;

  return (
    <aside
      aria-label="Preview"
      className="flex flex-col gap-3 lg:sticky lg:top-6"
      data-slot="visitor-preview"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
          What visitors see
        </span>
        <span className="text-muted-foreground text-xs">Live preview</span>
      </div>
      <Card className="bg-brand-mist shadow-lift" variant="elevated">
        <CardContent className="flex flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <Avatar size="xl">
              {avatarUrl ? <AvatarImage alt="" src={avatarUrl} /> : null}
              <AvatarFallback variant="brand">{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <b className="block truncate font-display text-[22px]">{name}</b>
              <p className="text-muted-foreground text-sm">
                @{username} ·{" "}
                {isAccepting
                  ? "Accepting Anonymous Messages"
                  : "Messages paused"}
              </p>
            </div>
          </div>
          {showAmaBanner ? (
            <AmaBanner eyebrow="AMA" prompt={amaPrompt} />
          ) : null}
          <div
            aria-hidden="true"
            className="min-h-[84px] rounded-md border border-input bg-card px-3.5 py-3 text-[15px] text-muted-foreground"
          >
            Write something honest…
          </div>
          <span
            aria-hidden="true"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-gradient font-medium text-base text-brand-foreground shadow-lift"
          >
            <LockIcon className="size-4" />
            Send anonymously
          </span>
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-sm">
        Updates as you type. Nothing goes live until you save.
      </p>
    </aside>
  );
}
