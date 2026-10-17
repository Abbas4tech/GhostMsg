import type { CardProps } from "./card";

export const CARD_VARIANTS = ["default", "glass", "ghost", "bordered"] as const;
export const CARD_SIZES = ["default", "sm", "lg"] as const;

export const cardMockContent = {
  body: "Anonymous messages you receive appear here.",
  description: "You have 6 total messages",
  footer: "Updated just now",
  title: "Your Messages",
};

export const defaultCardArgs: CardProps = {
  className: "w-96",
  size: "default",
  variant: "default",
};
