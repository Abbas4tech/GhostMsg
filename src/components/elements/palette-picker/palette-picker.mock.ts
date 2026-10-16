import { noop } from "@/mock/noop";
import { PALETTE_OPTIONS, type PalettePickerProps } from "./palette-picker";

export const defaultPalettePickerArgs: PalettePickerProps = {
  align: "end",
  label: "Color theme",
  onValueChange: noop,
  options: PALETTE_OPTIONS,
  size: "default",
  value: "spectral",
  variant: "ghost",
};
