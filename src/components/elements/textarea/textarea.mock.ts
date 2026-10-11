import { noop } from "@/mock/noop";
import type { Textarea } from "./textarea";

export const defaultTextareaArgs: React.ComponentProps<typeof Textarea> = {
  "aria-label": "Your reply",
  placeholder: "Type your reply here...",
  className: "w-96",
  disabled: false,
  onChange: noop,
};
