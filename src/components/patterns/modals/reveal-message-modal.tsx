"use client";

import type React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/elements/alert-dialog";
import type { MessageDto } from "@/types/api";

export interface RevealMessageModalProps {
  message: MessageDto | null;
  onClose: () => void;
  onConfirm: (message: MessageDto) => void;
  open: boolean;
}

/**
 * Opt-in reveal of a Quarantined Message. "Keep hidden" is the default focus:
 * not reading it is always fine.
 */
export function RevealMessageModal({
  open,
  message,
  onClose,
  onConfirm,
}: RevealMessageModalProps): React.JSX.Element | null {
  if (!message) {
    return null;
  }

  return (
    <AlertDialog onOpenChange={(isOpen) => !isOpen && onClose()} open={open}>
      <AlertDialogContent className="rounded-2xl shadow-lift sm:max-w-md">
        <AlertDialogHeader className="text-left sm:text-left">
          <AlertDialogTitle className="font-bold text-xl">
            Reveal this message?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            It was flagged for hurtful language. You don&apos;t have to read it.
            Keeping it hidden is always fine.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            autoFocus
            className="rounded-full"
            onClick={onClose}
          >
            Keep hidden
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
            onClick={() => onConfirm(message)}
          >
            Reveal once
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
