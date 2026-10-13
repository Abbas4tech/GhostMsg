import { noop } from "@/mock/noop";
import type { BulkActionToolbarProps } from "./bulk-action-toolbar";

export const defaultBulkActionToolbarArgs: BulkActionToolbarProps = {
  selectedCount: 3,
  isPending: false,
  onAction: noop,
  onExport: noop,
  onClearSelection: noop,
};
