import type { ButtonProps } from "./button";

export const defaultButtonMockProps: ButtonProps = {
  children: "Click Me",
  variant: "default",
  size: "default",
};

export const primaryButtonMockProps: ButtonProps = {
  children: "Primary Action",
  variant: "primary",
  size: "lg",
};

export const glassButtonMockProps: ButtonProps = {
  children: "Glass Action",
  variant: "glass",
  size: "md",
};
