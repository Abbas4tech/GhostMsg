import { noop } from "@/mock/noop";
import type { UnsavedChangesBarProps } from "./unsaved-changes-bar";

export const defaultUnsavedChangesBarArgs: UnsavedChangesBarProps = {
  isSaving: false,
  isVisible: true,
  onDiscard: noop,
  onSave: noop,
};
