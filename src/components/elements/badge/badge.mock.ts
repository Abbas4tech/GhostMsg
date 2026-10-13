import type { BadgeProps } from "./badge";

export const BADGE_VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "glass",
] as const;

export const BADGE_SIZES = ["sm", "md", "lg"] as const;

export const defaultBadgeArgs: BadgeProps = {
  children: "Public",
  variant: "default",
  size: "md",
};

export const countBadgeArgs: BadgeProps = {
  children: "12",
  variant: "secondary",
  size: "sm",
};
