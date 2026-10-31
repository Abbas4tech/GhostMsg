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
        /** Landing: 220px on phones (design MobLanding), 280px from `sm`. */
        fluid:
          "w-full max-w-[220px] gap-3 rounded-[24px] p-4.5 sm:max-w-[280px] sm:gap-4 sm:rounded-[28px] sm:p-6",
        md: "w-full max-w-[360px] gap-5 rounded-[32px] px-6 py-7",
        sm: "w-full max-w-[280px] gap-4 rounded-[28px] p-6",
      },
      tilt: {
        /** Phones lean left, desktop right (design MobLanding / Landing). */
        fluid: "motion-safe:-rotate-2 sm:motion-safe:rotate-2",
        none: "",
        right: "motion-safe:rotate-2",
      },
    },
  }
);

const questionVariants = cva(
  "text-balance font-bold font-display leading-[1.06]",
  {
    defaultVariants: { size: "md" },
    variants: {
      size: {
        fluid: "text-[21px] sm:text-[26px]",
        md: "text-[34px]",
        sm: "text-[26px]",
      },
    },
  }
);

const answerVariants = cva("font-semibold leading-snug", {
  defaultVariants: { size: "md" },
  variants: {
    size: {
      fluid: "text-[13px] sm:text-[17px]",
      md: "text-[17px]",
      sm: "text-[17px]",
    },
  },
});

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
  // Phones' 220px card (design MobLanding) keeps only the board's content:
  // no "answered" label or caption, smaller type, so nothing is clipped.
  const isFluid = size === "fluid";
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
        <span
          className={cn(
            "flex items-center gap-2 font-bold text-[15px]",
            isFluid && "max-sm:gap-1.5 max-sm:text-xs"
          )}
        >
          <Ghost
            aria-hidden="true"
            className={cn("size-5", isFluid && "max-sm:size-4")}
          />
          GhostMsg
        </span>
        {label ? (
          <span className="inline-flex h-[30px] items-center rounded-full bg-brand-overlay px-3 font-bold text-[13px]">
            {label}
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "relative flex flex-col gap-4",
          isFluid && "max-sm:gap-2.5"
        )}
      >
        <p
          className={cn(
            "font-bold text-sm uppercase tracking-wider",
            isFluid && "max-sm:text-[11px]"
          )}
        >
          An Anonymous Message
        </p>
        <blockquote className={questionVariants({ size })}>
          &ldquo;{question}&rdquo;
        </blockquote>
        {answer ? (
          <div
            className={cn(
              "rounded-[20px] bg-brand-overlay p-4",
              isFluid && "max-sm:rounded-[14px] max-sm:p-2.5"
            )}
          >
            <p
              className={cn(
                "mb-1.5 font-bold text-xs uppercase tracking-wider",
                isFluid && "max-sm:hidden"
              )}
            >
              {username} answered
            </p>
            <p className={answerVariants({ size })}>{answer}</p>
          </div>
        ) : null}
      </div>

      <figcaption className="relative flex flex-col gap-1">
        <span
          className={cn(
            "font-semibold text-[13px]",
            isFluid && "max-sm:hidden"
          )}
        >
          Send me one. Nobody will know it&apos;s you.
        </span>
        <span
          className={cn(
            "font-display font-extrabold text-lg",
            isFluid && "max-sm:font-bold max-sm:font-sans max-sm:text-xs"
          )}
        >
          {profileLabel}
        </span>
      </figcaption>
    </figure>
  );
}
