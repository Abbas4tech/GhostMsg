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
import type { Message } from "@/model/user.model";

export interface BlockSenderModalProps {
  isPending?: boolean;
  isSenderBlocked?: boolean;
  message: Message | null;
  onClose: () => void;
  onConfirm: (senderHash: string, isBlocked: boolean) => Promise<void> | void;
  open: boolean;
}

export function BlockSenderModal({
  open,
  message,
  isSenderBlocked = false,
  isPending = false,
  onClose,
  onConfirm,
}: BlockSenderModalProps): React.JSX.Element | null {
  if (!message?.senderHash) {
    return null;
  }

  let buttonText = isSenderBlocked ? "Unblock Sender" : "Block Sender";
  if (isPending) {
    buttonText = isSenderBlocked ? "Unblocking..." : "Blocking...";
  }

  const handleConfirm = async () => {
    if (message.senderHash) {
      await onConfirm(message.senderHash, isSenderBlocked);
    }
  };

  return (
    <AlertDialog onOpenChange={(isOpen) => !isOpen && onClose()} open={open}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSenderBlocked ? "Unblock this sender?" : "Block this sender?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSenderBlocked
              ? "Future messages from this sender are currently being silently dropped. Unblocking will allow them to send messages to your profile again."
              : "Future messages from this sender will be silently dropped. Their anonymity is preserved, and they will not be notified."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <LiquidButton
            disabled={isPending}
            onClick={handleConfirm}
            variant={isSenderBlocked ? "default" : "destructive"}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </LiquidButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
