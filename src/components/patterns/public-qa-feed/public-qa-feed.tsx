import type React from "react";
import { Skeleton } from "@/components/elements/skeleton";
import {
  SentimentBadge,
  type SentimentType,
} from "@/components/patterns/sentiment-badge";

export interface PublicQaItem {
  _id: string;
  content: string;
  createdAt: string | Date;
  reply: { text: string };
  sentimentTag?: SentimentType;
}

export interface PublicQaFeedProps {
  answers: PublicQaItem[];
  isLoading?: boolean;
  username: string;
}

/** Answered questions on the public profile. Renders nothing when empty. */
export function PublicQaFeed({
  answers,
  isLoading = false,
  username,
}: PublicQaFeedProps): React.JSX.Element | null {
  if (isLoading) {
    return (
      <div
        aria-label="Loading public answers"
        className="flex flex-col gap-2"
        data-slot="public-qa-feed"
        role="status"
      >
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    );
  }

  if (answers.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="public-qa-title"
      className="flex flex-col gap-2"
      data-slot="public-qa-feed"
    >
      <h2 className="text-h3" id="public-qa-title">
        Public Q&amp;A
      </h2>
      {answers.map((item) => (
        <article
          className="flex flex-col gap-2 rounded-xl border bg-card p-3.5 text-card-foreground"
          key={item._id}
        >
          <SentimentBadge
            className="self-start"
            sentiment={item.sentimentTag}
            size="sm"
          />
          <p className="font-message font-semibold text-body">{item.content}</p>
          <p className="text-muted-foreground text-sm">
            <span className="sr-only">{username} answered: </span>
            {item.reply.text}
          </p>
        </article>
      ))}
    </section>
  );
}
