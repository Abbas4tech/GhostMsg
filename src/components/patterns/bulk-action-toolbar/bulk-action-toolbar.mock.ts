import { noop } from "@/mock/noop";
import type { BulkActionToolbarProps } from "./bulk-action-toolbar";

export const defaultBulkActionToolbarArgs: BulkActionToolbarProps = {
  isPending: false,
  onAction: noop,
  onClearSelection: noop,
  onExport: noop,
  selectedCount: 3,
};
