import { noop } from "@/mock/noop";
import type { InputProps } from "./input";

export const INPUT_VARIANTS = ["default", "filled", "glass"] as const;
export const INPUT_SIZES = ["sm", "md", "lg"] as const;

export const defaultInputArgs: InputProps = {
  "aria-label": "Search messages",
  disabled: false,
  onChange: noop,
  placeholder: "Search messages...",
  sizeVariant: "md",
  variant: "default",
};

export const filledInputArgs = {
  "aria-label": "Username",
  defaultValue: "johndoe",
} satisfies Partial<InputProps>;
