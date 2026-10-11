import type { TextProps } from "./text";

export const TEXT_VARIANTS = [
  "h1",
  "h2",
  "h2-underline",
  "h3",
  "h4",
  "p",
  "lead",
  "large",
  "small",
  "muted",
  "blockquote",
  "inline-code",
] as const;

export const defaultTextArgs: TextProps = {
  children: "Send Messages like a Ghost. 👻",
  variant: "p",
};
