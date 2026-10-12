"use client";

import { Loader2 } from "lucide-react";
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
import { LiquidButton } from "@/components/elements/liquid-button";
import type { MessageDto } from "@/types/api";

export interface DeleteMessageModalProps {
  isPending?: boolean;
  message: MessageDto | null;
  onClose: () => void;
  onConfirm: (message: MessageDto) => Promise<void> | void;
  open: boolean;
}

export function DeleteMessageModal({
  open,
  message,
  isPending = false,
  onClose,
  onConfirm,
}: DeleteMessageModalProps): React.JSX.Element | null {
  if (!message) {
    return null;
  }

  const handleConfirm = async () => {
    await onConfirm(message);
  };

  return (
    <AlertDialog onOpenChange={(isOpen) => !isOpen && onClose()} open={open}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Message?</AlertDialogTitle>
          <AlertDialogDescription>
            This message will be permanently deleted from your inbox.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <LiquidButton
            disabled={isPending}
            onClick={handleConfirm}
            variant="destructive"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Deleting..." : "Delete"}
          </LiquidButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
