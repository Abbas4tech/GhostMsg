"use client";

import { Check, Ghost, Pause } from "lucide-react";
import Link from "next/link";
import type React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/elements/avatar";
import { Button } from "@/components/elements/button";
import { PalettePickerButton } from "@/components/elements/palette-picker";
import { ThemeTogglerButton } from "@/components/elements/theme-toggler";
import { AmaBanner } from "@/components/patterns/ama-banner";
import { BrandMark } from "@/components/patterns/brand-mark";
import {
  PublicQaFeed,
  type PublicQaItem,
} from "@/components/patterns/public-qa-feed";
import {
  SendMessageForm,
  type SendMessageFormProps,
} from "@/components/patterns/send-message-form";
import { SuggestedMessages } from "@/components/patterns/suggested-messages";
import { cn } from "@/lib/utils";

export interface PublicProfileSuggestions {
  isLoading?: boolean;
  items: string[];
  onRefresh: () => void;
  onSelect: (suggestion: string) => void;
}

export interface PublicProfileAnswers {
  isLoading?: boolean;
  items: PublicQaItem[];
}

export interface PublicProfileSendForm
  extends Omit<SendMessageFormProps, "username" | "suggestions"> {
  /** Just sent: shows the reassurance card instead of the form. */
  isSent?: boolean;
  onSendAnother?: () => void;
}

export interface PublicProfileProps {
  amaPrompt?: string | null;
  answers: PublicProfileAnswers;
  /** Profile photo (data URL); initials when absent. */
  avatarUrl?: string | null;
  className?: string;
  /** Shown instead of the username when set. */
  displayName?: string;
  /** Message Acceptance; false shows the calm paused state. */
  isAccepting?: boolean;
  /** No recipient with this username. */
  isNotFound?: boolean;
  /** Show AI Suggested Messages (recipient setting). */
  offerSuggestions?: boolean;
  sendForm: PublicProfileSendForm;
  /** Show the AMA banner (recipient setting). */
  showAmaBanner?: boolean;
  suggestions: PublicProfileSuggestions;
  username: string;
}

function Identity({
  username,
  displayName,
  avatarUrl,
  isAccepting,
}: {
  avatarUrl?: string | null;
  displayName?: string;
  isAccepting: boolean;
  username: string;
}): React.JSX.Element {
  const name = displayName?.trim() || username;
  return (
    <div className="flex items-center gap-3">
      <Avatar size="xl">
        {avatarUrl ? <AvatarImage alt="" src={avatarUrl} /> : null}
        <AvatarFallback variant="brand">{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h1 className="truncate text-h1">{name}</h1>
        <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
          {isAccepting ? (
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-success"
            />
          ) : (
            <Pause aria-hidden="true" className="size-3" />
          )}
          {name === username ? "" : `@${username} · `}
          {isAccepting ? "Accepting Anonymous Messages" : "Messages paused"}
        </p>
      </div>
    </div>
  );
}

function SentCard({
  username,
  onSendAnother,
}: {
  onSendAnother?: () => void;
  username: string;
}): React.JSX.Element {
  return (
    <div
      className="flex flex-col items-start gap-3 rounded-xl border bg-card p-5 text-card-foreground"
      role="status"
    >
      <span className="grid size-10 place-items-center rounded-full bg-success text-success-foreground motion-safe:animate-pulse-ring">
        <Check aria-hidden="true" className="size-5" />
      </span>
      <p className="font-display text-h3">
        Sent. {username} will never know it was you.
      </p>
      {onSendAnother ? (
        <Button
          className="rounded-full"
          onClick={onSendAnother}
          variant="outline"
        >
          Send another
        </Button>
      ) : null}
    </div>
  );
}

function PausedState({ username }: { username: string }): React.JSX.Element {
  return (
    <>
      <AmaBanner tone="quiet">
        <span className="grid size-11 place-items-center rounded-[14px] bg-accent text-accent-foreground">
          <Pause aria-hidden="true" className="size-5" />
        </span>
        <p className="pt-1.5 font-display text-h2">
          {username} is taking a breather.
        </p>
        <p className="text-muted-foreground text-sm">
          They aren&apos;t accepting new Anonymous Messages right now. The link
          stays here, and you can still read their answers.
        </p>
      </AmaBanner>
      <Button className="w-full rounded-full" disabled size="xl">
        Sending is paused
      </Button>
      <Button
        asChild
        className="w-full rounded-full"
        size="xl"
        variant="outline"
      >
        <Link href="/sign-up">Make your own link</Link>
      </Button>
    </>
  );
}

function NotFoundState({ username }: { username: string }): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
      <span
        aria-hidden="true"
        className="grid size-24 place-items-center rounded-t-[48px] rounded-b-[14px] bg-accent text-accent-foreground motion-safe:animate-float"
      >
        <Ghost className="size-11" />
      </span>
      <h1 className="text-h1">Nobody&apos;s home at this link.</h1>
      <p className="max-w-[300px] text-muted-foreground">
        We couldn&apos;t find <b className="text-foreground">/u/{username}</b>.
        It may be mistyped, or the Recipient removed it.
      </p>
      <Button
        asChild
        className="w-full max-w-[300px] rounded-full"
        size="xl"
        variant="brand"
      >
        <Link href={`/sign-up?username=${encodeURIComponent(username)}`}>
          Claim /u/{username}
        </Link>
      </Button>
      <Button asChild className="rounded-full" variant="ghost">
        <Link href="/">Go to GhostMsg</Link>
      </Button>
    </div>
  );
}

/**
 * Pure /u/[username] page body, phone-first (max 480px): header, identity,
 * AMA banner, message form with Suggested Messages, Public Q&A. Also the
 * sent, paused and not-found states. All data comes from the page.
 */
export function PublicProfile({
  username,
  amaPrompt,
  displayName,
  avatarUrl,
  showAmaBanner = true,
  offerSuggestions = true,
  isAccepting = true,
  isNotFound = false,
  sendForm,
  suggestions,
  answers,
  className,
}: PublicProfileProps): React.JSX.Element {
  const { isSent, onSendAnother, ...formProps } = sendForm;

  let body: React.ReactNode;
  if (isNotFound) {
    body = <NotFoundState username={username} />;
  } else if (isAccepting) {
    body = (
      <>
        <Identity
          avatarUrl={avatarUrl}
          displayName={displayName}
          isAccepting
          username={username}
        />
        {showAmaBanner ? <AmaBanner eyebrow="AMA" prompt={amaPrompt} /> : null}
        {isSent ? (
          <SentCard onSendAnother={onSendAnother} username={username} />
        ) : (
          <SendMessageForm
            {...formProps}
            suggestions={
              offerSuggestions ? (
                <SuggestedMessages
                  isLoading={suggestions.isLoading}
                  onRefresh={suggestions.onRefresh}
                  onSelect={suggestions.onSelect}
                  suggestions={suggestions.items}
                />
              ) : null
            }
            username={username}
          />
        )}
        <PublicQaFeed
          answers={answers.items}
          isLoading={answers.isLoading}
          username={username}
        />
      </>
    );
  } else {
    body = (
      <>
        <Identity
          avatarUrl={avatarUrl}
          displayName={displayName}
          isAccepting={false}
          username={username}
        />
        <PausedState username={username} />
        <PublicQaFeed
          answers={answers.items}
          isLoading={answers.isLoading}
          username={username}
        />
      </>
    );
  }

  return (
    <div
      className={cn("min-h-screen bg-brand-mist", className)}
      data-slot="public-profile"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col px-4">
        <header className="flex items-center gap-1 py-3">
          <BrandMark className="mr-auto" href="/" size="sm" />
          <Link
            className="inline-flex min-h-11 items-center px-1.5 font-bold text-primary text-sm"
            href="/sign-up"
          >
            Get your own link
          </Link>
          <PalettePickerButton size="sm" />
          <ThemeTogglerButton
            modes={["dark", "light"]}
            size="sm"
            variant="ghost"
          />
        </header>

        <main className="flex flex-1 flex-col gap-4 pt-2 pb-6">{body}</main>

        <footer className="pb-4 text-muted-foreground text-sm">
          Anonymous by design
        </footer>
      </div>
    </div>
  );
}
