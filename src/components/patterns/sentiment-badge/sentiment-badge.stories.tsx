import type { SentimentBadgeProps } from "./sentiment-badge";
import { SentimentBadge } from "./sentiment-badge";

export default {
  title: "Patterns/SentimentBadge",
  component: SentimentBadge,
};

export const Sweet = (args: SentimentBadgeProps) => (
  <SentimentBadge sentiment="sweet" {...args} />
);
export const Spicy = (args: SentimentBadgeProps) => (
  <SentimentBadge sentiment="spicy" {...args} />
);
export const Advice = (args: SentimentBadgeProps) => (
  <SentimentBadge sentiment="advice" {...args} />
);
