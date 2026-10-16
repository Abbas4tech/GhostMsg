import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/lib/utils";

export type SentimentType =
  | "sweet"
  | "curious"
  | "spicy"
  | "advice"
  | "neutral";

const sentimentBadgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold",
  {
    variants: {
      sentiment: {
        sweet:
          "border-sentiment-sweet/30 bg-sentiment-sweet-subtle text-sentiment-sweet",
        curious:
          "border-sentiment-curious/30 bg-sentiment-curious-subtle text-sentiment-curious",
        spicy:
          "border-sentiment-spicy/30 bg-sentiment-spicy-subtle text-sentiment-spicy",
        advice:
          "border-sentiment-advice/30 bg-sentiment-advice-subtle text-sentiment-advice",
        neutral:
          "border-sentiment-neutral/30 bg-sentiment-neutral-subtle text-sentiment-neutral",
      },
      size: {
        sm: "h-6 px-2 text-xs",
        md: "h-7 px-2.5 text-[13px]",
        lg: "h-8 px-3 text-sm",
      },
    },
    defaultVariants: {
      sentiment: "neutral",
      size: "sm",
    },
  }
);

const SENTIMENT_META: Record<SentimentType, { icon: string; label: string }> = {
  sweet: { icon: "💖", label: "Sweet" },
  curious: { icon: "🤔", label: "Curious" },
  spicy: { icon: "🔥", label: "Spicy" },
  advice: { icon: "💡", label: "Advice" },
  neutral: { icon: "👻", label: "Note" },
};

const isSentimentType = (value: unknown): value is SentimentType =>
  typeof value === "string" && value in SENTIMENT_META;

export interface SentimentBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    Omit<VariantProps<typeof sentimentBadgeVariants>, "sentiment"> {
  /** Unknown or missing values fall back to `neutral`. */
  sentiment?: SentimentType | null;
}

export function SentimentBadge({
  className,
  sentiment,
  size,
  ...props
}: SentimentBadgeProps): React.JSX.Element {
  const activeSentiment = isSentimentType(sentiment) ? sentiment : "neutral";
  const { icon, label } = SENTIMENT_META[activeSentiment];

  return (
    <span
      className={cn(
        sentimentBadgeVariants({ sentiment: activeSentiment, size }),
        className
      )}
      data-slot="sentiment-badge"
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

export { sentimentBadgeVariants };
export default SentimentBadge;
