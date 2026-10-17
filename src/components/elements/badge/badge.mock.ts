import type { BadgeProps } from "./badge";

export const BADGE_VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "glass",
  "success",
  "warning",
  "neutral",
  "count",
  "attention",
] as const;

export const defaultBadgeArgs: BadgeProps = {
  children: "Public",
  variant: "default",
};

export const countBadgeArgs: BadgeProps = {
  children: "12",
  variant: "count",
};
