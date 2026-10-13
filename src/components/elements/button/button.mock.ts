import { noop } from "@/mock/noop";
import type { ButtonProps } from "./button";

export const BUTTON_VARIANTS = [
  "default",
  "primary",
  "accent",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "glass",
  "link",
  "brand",
] as const;

export const BUTTON_SIZES = ["sm", "default", "lg", "xl"] as const;
export const BUTTON_ICON_SIZES = ["icon-sm", "icon", "icon-lg"] as const;

export const defaultButtonArgs: ButtonProps = {
  children: "Send message",
  variant: "default",
  size: "default",
  disabled: false,
  onClick: noop,
};

export const destructiveButtonArgs = {
  children: "Delete",
  variant: "destructive",
} satisfies Partial<ButtonProps>;
