"use client";

import { Loader2, Trash2 } from "lucide-react";
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
import type { MessageDto } from "@/types/api";

export interface DeleteMessageModalProps {
  isPending?: boolean;
  message: MessageDto | null;
  onClose: () => void;
  onConfirm: (message: MessageDto) => Promise<void> | void;
  open: boolean;
}

/** Confirm deleting one Anonymous Message (warns when its answer is public). */
export function DeleteMessageModal({
  open,
  message,
  isPending = false,
  onClose,
  onConfirm,
}: DeleteMessageModalProps): React.JSX.Element | null {
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

  const hasPublicAnswer = Boolean(message.reply?.isPublished);

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogContent className="rounded-2xl shadow-lift sm:max-w-md">
        <AlertDialogHeader className="gap-3 text-left sm:text-left">
          <span className="grid size-11 place-items-center rounded-[14px] bg-destructive/15 text-destructive">
            <Trash2 aria-hidden="true" className="size-5" />
          </span>
          <AlertDialogTitle className="font-bold text-[22px]">
            Delete this message?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            {hasPublicAnswer
              ? "It has a public answer on your profile, so that answer goes too. This can't be undone."
              : "It will be removed from your inbox for good. This can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="rounded-full"
            disabled={isPending}
            onClick={onClose}
          >
            Keep it
          </AlertDialogCancel>
          <Button
            className="rounded-full"
            disabled={isPending}
            onClick={handleConfirm}
            variant="destructive"
          >
            {isPending ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : null}
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
