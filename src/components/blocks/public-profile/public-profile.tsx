"use client";

import type React from "react";
import { AmaBanner } from "@/components/patterns/ama-banner";
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

export interface PublicProfileProps {
  amaPrompt?: string | null;
  answers: PublicProfileAnswers;
  className?: string;
  sendForm: Omit<SendMessageFormProps, "username">;
  suggestions: PublicProfileSuggestions;
  username: string;
}

/**
 * Pure /u/[username] section: AMA banner, message form, AI suggestions and
 * the public Q&A showcase. All data comes from the page.
 */
export function PublicProfile({
  username,
  amaPrompt,
  sendForm,
  suggestions,
  answers,
  className,
}: PublicProfileProps): React.JSX.Element {
  return (
    <div
      className={cn("flex flex-col gap-10", className)}
      data-slot="public-profile"
    >
      <AmaBanner prompt={amaPrompt} username={username} />

      <SendMessageForm username={username} {...sendForm} />

      <SuggestedMessages
        isLoading={suggestions.isLoading}
        onRefresh={suggestions.onRefresh}
        onSelect={suggestions.onSelect}
        suggestions={suggestions.items}
      />

      <PublicQaFeed
        answers={answers.items}
        isLoading={answers.isLoading}
        username={username}
      />
    </div>
  );
}

export default PublicProfile;
