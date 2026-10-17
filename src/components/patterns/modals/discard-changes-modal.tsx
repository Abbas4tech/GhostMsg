"use client";

import type React from "react";
import { useCallback } from "react";
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
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onKeepEditing();
      }
    },
    [onKeepEditing]
  );

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogContent className="rounded-2xl shadow-lift sm:max-w-md">
        <AlertDialogHeader className="text-left sm:text-left">
          <AlertDialogTitle className="text-h2">
            Discard unsaved changes?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
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
