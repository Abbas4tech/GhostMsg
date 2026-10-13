import type { SentimentType } from "@/components/patterns/sentiment-badge";

/** Example copy for the landing illustrations (not real user data). */
export const landingContent = {
  example: {
    profileLabel: "ghostmsg.app/u/maya",
    message: "I think you are way funnier than you let on.",
    answer: "Ha, thank you. I save it for group chats.",
    sentiment: "sweet" as SentimentType,
  },
  showcase: {
    question: "What would you tell yourself on your first day of work?",
    answer:
      "Ask for the thing you want. Nobody gives it to you for being quiet.",
    sentiment: "advice" as SentimentType,
    username: "maya",
    profileLabel: "ghostmsg.app/u/maya",
  },
} as const;
