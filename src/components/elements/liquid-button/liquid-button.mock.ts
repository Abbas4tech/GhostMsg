import { noop } from "@/mock/noop";
import type { LiquidButtonProps } from "./liquid-button";

export const LIQUID_BUTTON_VARIANTS = [
  "default",
  "destructive",
  "secondary",
  "ghost",
] as const;
export const LIQUID_BUTTON_SIZES = ["sm", "default", "lg"] as const;

export const defaultLiquidButtonArgs: LiquidButtonProps = {
  children: "Save Topic Banner",
  disabled: false,
  onClick: noop,
  size: "default",
  variant: "default",
};
