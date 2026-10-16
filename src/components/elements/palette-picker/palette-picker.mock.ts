import { noop } from "@/mock/noop";
import { PALETTE_OPTIONS, type PalettePickerProps } from "./palette-picker";

export const defaultPalettePickerArgs: PalettePickerProps = {
  options: PALETTE_OPTIONS,
  value: "spectral",
  onValueChange: noop,
  label: "Color theme",
  variant: "ghost",
  size: "default",
  align: "end",
};
