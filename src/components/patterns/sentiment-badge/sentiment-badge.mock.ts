import type { SentimentBadgeProps, SentimentType } from "./sentiment-badge";

export const SENTIMENTS: SentimentType[] = [
  "sweet",
  "curious",
  "spicy",
  "advice",
  "neutral",
];

export const SENTIMENT_BADGE_SIZES = ["sm", "md", "lg"] as const;

export const defaultSentimentBadgeArgs: SentimentBadgeProps = {
  sentiment: "sweet",
  size: "sm",
};
