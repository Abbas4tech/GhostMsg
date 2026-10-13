import { noop } from "@/mock/noop";
import type { IconButtonProps } from "./icon-button";

export const ICON_BUTTON_VARIANTS = [
  "default",
  "accent",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const;
export const ICON_BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const;

export const defaultIconButtonArgs: IconButtonProps = {
  "aria-label": "Star message",
  variant: "default",
  size: "default",
  onClick: noop,
};
