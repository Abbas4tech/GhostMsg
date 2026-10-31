"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useRef } from "react";
import { AuthPanel } from "@/components/blocks/auth-panel";
import { Button } from "@/components/elements/button";
import { ShareLinkCard } from "@/components/patterns/share-link-card";

export interface VerifySuccessProps {
  /** Copy the Public Profile Link (the page writes the clipboard and toasts). */
  onCopy: () => void;
  /** Native share sheet (hidden when the browser has none). */
  onShare?: () => void;
  profileUrl: string;
  /** Where "Sign in to open your inbox" goes. Verifying doesn't sign in. */
  signInHref?: string;
}

/**
 * "You're in. Your link is live." (design MobVerifySuccess, Auth board): the
 * success mark, the new Public Profile Link with Copy / Share…, and the way
 * on to sign in. Focus moves to the heading because it replaces the form.
 */
export function VerifySuccess({
  onCopy,
  onShare,
  profileUrl,
  signInHref = "/sign-in",
}: VerifySuccessProps): React.JSX.Element {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div data-slot="verify-success">
      <AuthPanel
        align="center"
        description="Share it anywhere. Anonymous Messages land in your inbox."
        icon={<Check aria-hidden="true" />}
        iconTone="success"
        title="You're in. Your link is live."
        titleRef={titleRef}
      >
        <div className="flex flex-col gap-5 max-sm:flex-1">
          <ShareLinkCard
            layout="compact"
            onCopy={onCopy}
            onShare={onShare}
            profileUrl={profileUrl}
          />
          <Button
            asChild
            className="w-full rounded-full max-sm:mt-auto max-sm:h-13"
            size="xl"
            variant="brand"
          >
            <Link href={signInHref}>
              Sign in to open your inbox
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </AuthPanel>
    </div>
  );
}
