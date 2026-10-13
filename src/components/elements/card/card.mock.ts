import type { CardProps } from "./card";

export const CARD_VARIANTS = ["default", "glass", "ghost", "bordered"] as const;
export const CARD_SIZES = ["default", "sm", "lg"] as const;

export const cardMockContent = {
  title: "Your Messages",
  description: "You have 6 total messages",
  body: "Anonymous messages you receive appear here.",
  footer: "Updated just now",
};

export const defaultCardArgs: CardProps = {
  variant: "default",
  size: "default",
  className: "w-96",
};
