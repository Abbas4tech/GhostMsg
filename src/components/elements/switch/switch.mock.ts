import { noop } from "@/mock/noop";
import type { SwitchProps } from "./switch";

export const SWITCH_VARIANTS = ["default", "success"] as const;
export const SWITCH_SIZES = ["sm", "md", "lg", "xl"] as const;

export const defaultSwitchArgs: SwitchProps = {
  "aria-label": "Accept messages",
  disabled: false,
  onCheckedChange: noop,
  size: "md",
  variant: "default",
};

export const checkedSwitchArgs = {
  defaultChecked: true,
} satisfies Partial<SwitchProps>;
