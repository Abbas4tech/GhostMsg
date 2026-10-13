import { noop } from "@/mock/noop";
import type { UnsavedChangesBarProps } from "./unsaved-changes-bar";

export const defaultUnsavedChangesBarArgs: UnsavedChangesBarProps = {
  isVisible: true,
  isSaving: false,
  onDiscard: noop,
  onSave: noop,
};
