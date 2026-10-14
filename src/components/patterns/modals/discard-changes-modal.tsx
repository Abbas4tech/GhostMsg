"use client";

import type React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/elements/alert-dialog";
import { Button } from "@/components/elements/button";

export interface DiscardChangesModalProps {
  /** Leave the page and drop the unsaved edits. */
  onDiscard: () => void;
  /** Stay on the page with the edits intact. */
  onKeepEditing: () => void;
  open: boolean;
}

/** Asked when leaving a page with unsaved edits. "Keep editing" (focused first) is the safe default. */
export function DiscardChangesModal({
  open,
  onDiscard,
  onKeepEditing,
}: DiscardChangesModalProps): React.JSX.Element {
  return (
    <AlertDialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onKeepEditing();
        }
      }}
      open={open}
    >
      <AlertDialogContent className="rounded-2xl shadow-lift sm:max-w-md">
        <AlertDialogHeader className="text-left sm:text-left">
          <AlertDialogTitle className="font-bold text-[22px]">
            Discard unsaved changes?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            Your edits haven&apos;t been saved. Leave now and they&apos;re gone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">
            Keep editing
          </AlertDialogCancel>
          <Button
            className="rounded-full"
            onClick={onDiscard}
            variant="destructive"
          >
            Discard and leave
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DiscardChangesModal;
