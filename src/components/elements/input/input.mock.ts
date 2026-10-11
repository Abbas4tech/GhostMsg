import { noop } from "@/mock/noop";
import type { InputProps } from "./input";

export const INPUT_VARIANTS = ["default", "filled", "glass"] as const;
export const INPUT_SIZES = ["sm", "md", "lg"] as const;

export const defaultInputArgs: InputProps = {
  "aria-label": "Search messages",
  placeholder: "Search messages...",
  variant: "default",
  sizeVariant: "md",
  disabled: false,
  onChange: noop,
};

export const filledInputArgs = {
  defaultValue: "johndoe",
  "aria-label": "Username",
} satisfies Partial<InputProps>;
