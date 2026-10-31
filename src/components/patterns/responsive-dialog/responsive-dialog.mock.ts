import { noop } from "@/mock/noop";

export const responsiveDialogMock = {
  cancel: "Cancel",
  confirm: "Save",
  description: "Dialog on desktop, a bottom Drawer below 768px.",
  onOpenChange: noop,
  open: true,
  title: "Change username",
};
