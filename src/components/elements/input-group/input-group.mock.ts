import type { VariantProps } from "class-variance-authority";
import type { inputGroupVariants } from "./input-group";

export const inputGroupMockContent = {
  label: "Email",
  placeholder: "you@example.com",
};

export const defaultInputGroupArgs: VariantProps<typeof inputGroupVariants> = {
  shape: "default",
  size: "default",
  tone: "default",
};
