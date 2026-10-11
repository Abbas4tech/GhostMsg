import { noop } from "@/mock/noop";
import type { SwitchProps } from "./switch";

export const SWITCH_VARIANTS = ["default", "success"] as const;
export const SWITCH_SIZES = ["sm", "md", "lg"] as const;

export const defaultSwitchArgs: SwitchProps = {
  "aria-label": "Accept messages",
  variant: "default",
  size: "md",
  disabled: false,
  onCheckedChange: noop,
};

export const checkedSwitchArgs = {
  defaultChecked: true,
} satisfies Partial<SwitchProps>;
