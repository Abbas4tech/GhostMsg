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
  "inline-flex items-center gap-1 rounded-full font-medium",
  {
    variants: {
      sentiment: {
        sweet: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
        curious: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        spicy: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
        advice: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        neutral: "bg-muted text-muted-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
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
