"use client";

import { Check, ChevronLeft, Ghost, Pause } from "lucide-react";
import Link from "next/link";
import type React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/elements/avatar";
import { Button } from "@/components/elements/button";
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
  /** Just sent: the whole page becomes the "Sent." screen. */
  isSent?: boolean;
  onSendAnother?: () => void;
  /** The message just sent, repeated under "You sent". */
  sentContent?: string | null;
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
        <h1 className="truncate text-h2">{name}</h1>
        <p className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm">
          <span>@{username} ·</span>
          <span className="inline-flex items-center gap-1.5">
            {isAccepting ? (
              <span
                aria-hidden="true"
                className="size-[7px] rounded-full bg-success"
              />
            ) : (
              <Pause aria-hidden="true" className="size-3" />
            )}
            {isAccepting ? "Accepting" : "Paused"}
          </span>
        </p>
      </div>
    </div>
  );
}

/**
 * Design MobPublicSent: the success mark, the reassurance, the message as
 * sent, then Send another / Get your own link at the bottom.
 */
function SentScreen({
  name,
  onSendAnother,
  sentContent,
}: {
  name: string;
  onSendAnother?: () => void;
  sentContent?: string | null;
}): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col gap-6 pt-6" role="status">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="grid size-19 place-items-center rounded-full bg-success text-success-foreground shadow-[0_0_0_10px_color-mix(in_oklch,var(--success)_16%,transparent)]">
          <Check aria-hidden="true" className="size-9" />
        </span>
        <h1 className="max-w-80 text-h1">
          Sent. {name} will never know it was you.
        </h1>
        <p className="max-w-75 text-muted-foreground">
          If they answer publicly, it shows up on their page.
        </p>
      </div>
      {sentContent ? (
        <div className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-card-foreground">
          <span className="text-muted-foreground text-overline uppercase">
            You sent
          </span>
          <p className="text-pretty font-message text-body">{sentContent}</p>
        </div>
      ) : null}
      <div className="mt-auto flex flex-col gap-2.5">
        {onSendAnother ? (
          <Button className="h-13 w-full rounded-full" onClick={onSendAnother}>
            Send another
          </Button>
        ) : null}
        <Button asChild className="h-13 w-full rounded-full" variant="outline">
          <Link href="/sign-up">Get your own link</Link>
        </Button>
      </div>
    </div>
  );
}

/** Design MobPublicPaused: a calm dashed card, then one way forward. */
function PausedState({ name }: { name: string }): React.JSX.Element {
  return (
    <>
      <AmaBanner tone="quiet">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Pause aria-hidden="true" className="size-5.5" />
        </span>
        <h2 className="pt-1.5 font-display text-h2">
          {name} is taking a breather.
        </h2>
        <p className="text-muted-foreground">
          They aren&apos;t accepting new Anonymous Messages right now. You can
          still read their answers below.
        </p>
      </AmaBanner>
      <Button asChild className="h-13 w-full rounded-full" variant="brand">
        <Link href="/sign-up">Make your own link</Link>
      </Button>
    </>
  );
}

function NotFoundState({ username }: { username: string }): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 pt-6 pb-10 text-center">
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
      <div className="mt-3 flex w-full flex-col gap-2.5">
        <Button asChild className="h-13 w-full rounded-full" variant="brand">
          <Link href={`/sign-up?username=${encodeURIComponent(username)}`}>
            Claim /u/{username}
          </Link>
        </Button>
        <Button asChild className="h-11 w-full rounded-full" variant="ghost">
          <Link href="/">Go to GhostMsg</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Brand + "Get your own link" (MobPublic); brand only when not found; on the
 * sent screen a "‹ Name" back to the profile instead (MobPublicSent).
 */
function PublicProfileHeader({
  isNotFound,
  name,
  onBack,
}: {
  isNotFound: boolean;
  name: string;
  onBack?: () => void;
}): React.JSX.Element {
  if (onBack) {
    return (
      <header className="-ml-3 flex min-h-13 items-center pt-2">
        <Button
          className="h-11 gap-1 rounded-full pr-3 pl-1.5 text-body"
          onClick={onBack}
          variant="ghost"
        >
          <ChevronLeft aria-hidden="true" className="size-5.5" />
          {name}
        </Button>
      </header>
    );
  }
  return (
    <header className="flex items-center gap-1 py-3">
      <BrandMark className="mr-auto" href="/" size="sm" />
      {isNotFound ? null : (
        <Link
          className="inline-flex min-h-11 items-center px-1.5 font-bold text-primary text-sm"
          href="/sign-up"
        >
          Get your own link
        </Link>
      )}
    </header>
  );
}

/**
 * Pure /u/[username] page body, phone-first (max 480px): header, identity,
 * AMA banner, message form with Suggested Messages, Public Q&A. Also the
 * sent, paused and not-found states (design MobPublic*). All data comes
 * from the page.
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
  const { isSent, onSendAnother, sentContent, ...formProps } = sendForm;
  const name = displayName?.trim() || username;
  const showSentScreen = Boolean(isSent) && !isNotFound;

  let body: React.ReactNode;
  if (isNotFound) {
    body = <NotFoundState username={username} />;
  } else if (showSentScreen) {
    body = (
      <SentScreen
        name={name}
        onSendAnother={onSendAnother}
        sentContent={sentContent}
      />
    );
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
        <SendMessageForm
          className="rounded-xl border bg-card p-4 text-card-foreground shadow-soft"
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
        <PausedState name={name} />
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
        <PublicProfileHeader
          isNotFound={isNotFound}
          name={name}
          onBack={showSentScreen ? onSendAnother : undefined}
        />

        <main className="flex flex-1 flex-col gap-4 pt-2 pb-6">{body}</main>

        {showSentScreen ? null : (
          <footer className="pb-4 text-muted-foreground text-sm">
            Anonymous by design
          </footer>
        )}
      </div>
    </div>
  );
}
