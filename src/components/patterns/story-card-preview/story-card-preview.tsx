import { cva, type VariantProps } from "class-variance-authority";
import { Ghost } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

const storyCardPreviewVariants = cva(
  "relative flex aspect-[9/16] flex-col justify-between overflow-hidden bg-brand-gradient text-brand-foreground shadow-lift",
  {
    defaultVariants: { size: "md", tilt: "none" },
    variants: {
      size: {
        md: "w-full max-w-[360px] gap-5 rounded-[32px] px-6 py-7",
        sm: "w-full max-w-[280px] gap-4 rounded-[28px] p-6",
      },
      tilt: { none: "", right: "motion-safe:rotate-2" },
    },
  }
);

const questionVariants = cva(
  "text-balance font-bold font-display leading-[1.06]",
  {
    defaultVariants: { size: "md" },
    variants: { size: { md: "text-[34px]", sm: "text-[26px]" } },
  }
);

export interface StoryCardPreviewProps
  extends VariantProps<typeof storyCardPreviewVariants> {
  /** Recipient's answer; omitted for a question-only card. */
  answer?: string;
  className?: string;
  /** Sentiment chip, e.g. "💖 Sweet". */
  label?: string;
  /** Public Profile Link shown in the footer, without protocol. */
  profileLabel: string;
  question: string;
  username: string;
}

/**
 * The 9:16 Story Card look (Instagram / Snapchat): an Anonymous Message, the
 * recipient's answer and their link on the brand gradient. Visual only; the
 * exported PNG is drawn by StoryCardModal.
 */
export function StoryCardPreview({
  question,
  answer,
  username,
  profileLabel,
  label,
  size,
  tilt,
  className,
}: StoryCardPreviewProps): React.JSX.Element {
  return (
    <figure
      className={cn(storyCardPreviewVariants({ size, tilt }), className)}
      data-slot="story-card-preview"
    >
      <span
        aria-hidden="true"
        className="absolute -top-16 -right-16 size-56 rounded-full bg-brand-foreground/10"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-24 -left-20 size-52 rounded-full bg-brand-overlay"
      />

      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold text-[15px]">
          <Ghost aria-hidden="true" className="size-5" />
          GhostMsg
        </span>
        {label ? (
          <span className="inline-flex h-[30px] items-center rounded-full bg-brand-overlay px-3 font-bold text-[13px]">
            {label}
          </span>
        ) : null}
      </div>

      <div className="relative flex flex-col gap-4">
        <p className="font-bold text-sm uppercase tracking-wider">
          An Anonymous Message
        </p>
        <blockquote className={questionVariants({ size })}>
          &ldquo;{question}&rdquo;
        </blockquote>
        {answer ? (
          <div className="rounded-[20px] bg-brand-overlay p-4">
            <p className="mb-1.5 font-bold text-xs uppercase tracking-wider">
              {username} answered
            </p>
            <p className="font-semibold text-[17px] leading-snug">{answer}</p>
          </div>
        ) : null}
      </div>

      <figcaption className="relative flex flex-col gap-1">
        <span className="font-semibold text-[13px]">
          Send me one. Nobody will know it&apos;s you.
        </span>
        <span className="font-display font-extrabold text-lg">
          {profileLabel}
        </span>
      </figcaption>
    </figure>
  );
}
