"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/elements/button";

function GoogleIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface AuthOAuthHeaderProps {
  /** Divider text: "or with email" (sign-up), "or" (sign-in, design MobSignIn). */
  dividerLabel?: string;
  onGoogleSignIn: () => void;
}

/** "Continue with Google" first, then the divider. 52px on phones. */
export function AuthOAuthHeader({
  dividerLabel = "or with email",
  onGoogleSignIn,
}: AuthOAuthHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4" data-slot="auth-oauth-header">
      <Button
        className="w-full rounded-full max-sm:h-13"
        onClick={onGoogleSignIn}
        size="xl"
        type="button"
        variant="outline"
      >
        <GoogleIcon />
        Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-muted-foreground text-xs sm:text-sm">
        <hr className="flex-1 border-border" />
        {dividerLabel}
        <hr className="flex-1 border-border" />
      </div>
    </div>
  );
}

export interface AuthFormFooterProps {
  alternateHref: string;
  alternateLabel: string;
  /** Text before the alternate link, e.g. "Already have a link?". */
  alternatePrompt: string;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  /** Brand gradient for sign-up's primary action. */
  submitVariant?: "default" | "brand";
}

/**
 * Full-width submit button and the "switch to sign in / sign up" prompt.
 * Phones: pinned to the bottom of the screen (the form is `max-sm:flex-1`).
 */
export function AuthFormFooter({
  isSubmitting,
  isSubmitDisabled,
  submitLabel,
  submittingLabel,
  submitVariant = "default",
  alternatePrompt,
  alternateHref,
  alternateLabel,
}: AuthFormFooterProps): React.JSX.Element {
  return (
    <footer className="flex flex-col gap-3 max-sm:mt-auto sm:gap-4">
      <Button
        className="w-full rounded-full max-sm:h-13"
        disabled={isSubmitDisabled}
        size="xl"
        type="submit"
        variant={submitVariant}
      >
        {isSubmitting ? (
          <>
            <Loader2 aria-hidden="true" className="animate-spin" />
            {submittingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>

      <p className="text-center text-muted-foreground text-sm">
        {alternatePrompt}{" "}
        <Link
          className="font-bold text-primary underline-offset-4 hover:underline sm:font-semibold"
          href={alternateHref}
        >
          {alternateLabel}
        </Link>
      </p>
    </footer>
  );
}
