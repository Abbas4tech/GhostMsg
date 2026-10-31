import { noop } from "@/mock/noop";
import type { ShortcutSheetProps } from "./shortcut-sheet";

export const defaultShortcutSheetArgs: ShortcutSheetProps = {
  onOpenChange: noop,
  open: true,
};
