"use client";

import type React from "react";
import { useCallback } from "react";
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
import { quarantineRevealReason } from "@/lib/messages/quarantine-reason";
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
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose();
      }
    },
    [onClose]
  );
  const handleConfirm = useCallback(() => {
    if (message) {
      onConfirm(message);
    }
  }, [onConfirm, message]);

  if (!message) {
    return null;
  }

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogContent className="rounded-2xl shadow-lift sm:max-w-md">
        <AlertDialogHeader className="text-left sm:text-left">
          <AlertDialogTitle className="text-h3">
            Reveal this message?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {quarantineRevealReason(message?.quarantineReason)} You don&apos;t
            have to read it. Keeping it hidden is always fine.
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
            onClick={handleConfirm}
          >
            Reveal once
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
