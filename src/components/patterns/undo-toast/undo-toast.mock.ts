import { noop } from "@/mock/noop";
import type { ShowUndoToastOptions } from "./undo-toast";

/** Design Feedback board: verb first, one line, never the message text. */
export const defaultUndoToastOptions: ShowUndoToastOptions = {
  durationMs: 10_000,
  message: "All messages deleted",
  onCommit: noop,
  onUndo: noop,
};
