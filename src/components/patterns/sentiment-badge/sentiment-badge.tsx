"use client";

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
  "inline-flex items-center gap-1 rounded-full border font-semibold outline-none transition-colors",
  {
    variants: {
      sentiment: {
        sweet:
          "border-pink-200 bg-pink-500/10 text-pink-600 dark:border-pink-800 dark:bg-pink-500/20 dark:text-pink-300",
        curious:
          "border-blue-200 bg-blue-500/10 text-blue-600 dark:border-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
        spicy:
          "border-amber-200 bg-amber-500/10 text-amber-600 dark:border-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
        advice:
          "border-emerald-200 bg-emerald-500/10 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
        neutral:
          "border-gray-200 bg-gray-500/10 text-gray-600 dark:border-gray-800 dark:bg-gray-500/20 dark:text-gray-300",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      sentiment: "neutral",
      size: "sm",
    },
  }
);

const sentimentIcons: Record<SentimentType, string> = {
  sweet: "🍬",
  curious: "🔍",
  spicy: "🌶️",
  advice: "💡",
  neutral: "💬",
};

export interface SentimentBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof sentimentBadgeVariants> {
  sentiment?: SentimentType;
}

export function SentimentBadge({
  className,
  sentiment = "neutral",
  size,
  children,
  ...props
}: SentimentBadgeProps): React.JSX.Element {
  const icon = sentimentIcons[sentiment];
  const capitalized = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);

  return (
    <span
      className={cn(sentimentBadgeVariants({ sentiment, size, className }))}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{children ?? capitalized}</span>
    </span>
  );
}

export { sentimentBadgeVariants };
export default SentimentBadge;
