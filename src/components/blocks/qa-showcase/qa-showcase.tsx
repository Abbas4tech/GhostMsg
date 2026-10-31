import type React from "react";
import {
  SentimentBadge,
  type SentimentType,
} from "@/components/patterns/sentiment-badge";
import { StoryCardPreview } from "@/components/patterns/story-card-preview";
import { cn } from "@/lib/utils";

export interface QaShowcaseProps {
  answer: string;
  className?: string;
  /** Public Profile Link label without protocol. */
  profileLabel: string;
  question: string;
  sentiment: SentimentType;
  username: string;
}

/**
 * Landing section: one answered question as a Public Q&A and a Story Card.
 * Phones (design MobLanding): heading, short lead and the tilted card only.
 */
export function QaShowcase({
  question,
  answer,
  sentiment,
  username,
  profileLabel,
  className,
}: QaShowcaseProps): React.JSX.Element {
  return (
    <section
      className={cn(
        "mx-auto grid w-full max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-center gap-3.5 px-gutter pt-10 sm:gap-10 sm:pt-0 sm:pb-18",
        className
      )}
      data-slot="qa-showcase"
    >
      <div className="flex flex-col gap-3.5 sm:gap-4">
        <h2 className="text-balance text-h2 md:text-h1">
          Answer once. Post it everywhere.
        </h2>
        <p className="max-w-[480px] text-muted-foreground sm:hidden">
          Publish an answer as a Public Q&amp;A, or export a 9:16 Story Card for
          Instagram and Snapchat.
        </p>
        <p className="max-w-[480px] text-body-lg text-muted-foreground max-sm:hidden">
          Pick a message, write your answer, and publish it as a Public Q&amp;A
          or export a 9:16 Story Card for Instagram and Snapchat.
        </p>
        <article className="flex flex-col gap-2.5 rounded-xl border bg-card p-[18px] text-card-foreground shadow-soft max-sm:hidden">
          <SentimentBadge className="self-start" sentiment={sentiment} />
          <p className="font-message font-semibold">{question}</p>
          <hr className="border-border" />
          <p className="text-muted-foreground">{answer}</p>
        </article>
      </div>
      <div className="flex justify-center pt-3 pb-1 sm:p-0">
        <StoryCardPreview
          answer={answer}
          profileLabel={profileLabel}
          question={question}
          size="fluid"
          tilt="fluid"
          username={username}
        />
      </div>
    </section>
  );
}
