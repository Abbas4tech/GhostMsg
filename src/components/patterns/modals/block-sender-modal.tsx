"use client";

import { Ban, Loader2, ShieldOff } from "lucide-react";
import type React from "react";
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import type { MessageDto } from "@/types/api";

export interface BlockSenderModalProps {
  isPending?: boolean;
  isSenderBlocked?: boolean;
  message: MessageDto | null;
  onClose: () => void;
  /** `alsoDelete` is true when "Block and delete this message" is chosen. */
  onConfirm: (
    senderHash: string,
    isBlocked: boolean,
    alsoDelete: boolean
  ) => Promise<void> | void;
  open: boolean;
}

const BLOCK_OPTIONS = [
  { value: true, label: "Block and delete this message" },
  { value: false, label: "Block only" },
] as const;

/**
 * Block (or unblock) a sender by their Sender Hash. Explains that nobody's
 * identity is revealed; blocking can also delete the message.
 */
export function BlockSenderModal({
  open,
  message,
  isSenderBlocked = false,
  isPending = false,
  onClose,
  onConfirm,
}: BlockSenderModalProps): React.JSX.Element | null {
  const [alsoDelete, setAlsoDelete] = useState(true);

  if (!message?.senderHash) {
    return null;
  }
  const { senderHash } = message;

  let buttonText = isSenderBlocked ? "Unblock sender" : "Block sender";
  if (isPending) {
    buttonText = isSenderBlocked ? "Unblocking..." : "Blocking...";
  }

  return (
    <AlertDialog onOpenChange={(isOpen) => !isOpen && onClose()} open={open}>
      <AlertDialogContent className="rounded-2xl shadow-lift sm:max-w-md">
        <AlertDialogHeader className="gap-3 text-left sm:text-left">
          <span className="grid size-11 place-items-center rounded-[14px] bg-accent text-accent-foreground">
            {isSenderBlocked ? (
              <ShieldOff aria-hidden="true" className="size-5" />
            ) : (
              <Ban aria-hidden="true" className="size-5" />
            )}
          </span>
          <AlertDialogTitle className="font-bold text-[22px]">
            {isSenderBlocked ? "Unblock this sender?" : "Block this sender?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px]">
            {isSenderBlocked
              ? "They'll be able to send you Anonymous Messages again. You still won't know who they are."
              : "You'll never see who they are. Blocking uses their Sender Hash, an anonymous fingerprint, so they stay anonymous to you and you stay safe from them. They aren't told."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isSenderBlocked ? null : (
          <fieldset aria-label="Block options" className="flex flex-col gap-2">
            {BLOCK_OPTIONS.map((option) => (
              <label
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-[14px] border px-3 py-2.5 font-semibold text-[15px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                  alsoDelete === option.value && "border-primary bg-accent"
                )}
                key={option.label}
              >
                <input
                  checked={alsoDelete === option.value}
                  className="size-5 accent-primary"
                  name="block-option"
                  onChange={() => setAlsoDelete(option.value)}
                  type="radio"
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            className="rounded-full"
            disabled={isPending}
            onClick={onClose}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            className="rounded-full"
            disabled={isPending}
            onClick={() =>
              onConfirm(
                senderHash,
                isSenderBlocked,
                !isSenderBlocked && alsoDelete
              )
            }
            variant={isSenderBlocked ? "default" : "destructive"}
          >
            {isPending ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : null}
            {buttonText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
