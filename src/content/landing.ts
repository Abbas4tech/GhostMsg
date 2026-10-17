import type { SentimentType } from "@/components/patterns/sentiment-badge";

/** Example copy for the landing illustrations (not real user data). */
export const landingContent = {
  example: {
    answer: "Ha, thank you. I save it for group chats.",
    message: "I think you are way funnier than you let on.",
    profileLabel: "ghostmsg.app/u/maya",
    sentiment: "sweet" as SentimentType,
  },
  showcase: {
    answer:
      "Ask for the thing you want. Nobody gives it to you for being quiet.",
    profileLabel: "ghostmsg.app/u/maya",
    question: "What would you tell yourself on your first day of work?",
    sentiment: "advice" as SentimentType,
    username: "maya",
  },
} as const;
