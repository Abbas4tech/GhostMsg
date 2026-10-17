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

/** Landing section: one answered question as a Public Q&A and a Story Card. */
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
        "mx-auto grid w-full max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-center gap-10 px-4 pb-18 sm:px-6",
        className
      )}
      data-slot="qa-showcase"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-balance font-bold text-[clamp(32px,4vw,48px)] leading-[1.05] tracking-tight">
          Answer once. Post it everywhere.
        </h2>
        <p className="max-w-[480px] text-lg text-muted-foreground">
          Pick a message, write your answer, and publish it as a Public Q&amp;A
          or export a 9:16 Story Card for Instagram and Snapchat.
        </p>
        <article className="flex flex-col gap-2.5 rounded-xl border bg-card p-[18px] text-card-foreground shadow-soft">
          <SentimentBadge className="self-start" sentiment={sentiment} />
          <p className="font-message font-semibold">{question}</p>
          <hr className="border-border" />
          <p className="text-muted-foreground">{answer}</p>
        </article>
      </div>
      <div className="flex justify-center">
        <StoryCardPreview
          answer={answer}
          profileLabel={profileLabel}
          question={question}
          size="sm"
          tilt="right"
          username={username}
        />
      </div>
    </section>
  );
}
