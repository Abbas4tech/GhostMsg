"use client";

import { Trash2Icon } from "lucide-react";
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

export interface DeleteAllMessagesModalProps {
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  /** How many messages will go (shown in the title). */
  total: number;
}

/** Danger zone: confirm deleting every message (there's a short undo after). */
export function DeleteAllMessagesModal({
  open,
  onOpenChange,
  total,
  onConfirm,
}: DeleteAllMessagesModalProps): React.JSX.Element {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent className="rounded-2xl shadow-lift sm:max-w-md">
        <AlertDialogHeader className="gap-3 text-left sm:text-left">
          <span className="grid size-11 place-items-center rounded-[14px] bg-destructive/15 text-destructive">
            <Trash2Icon aria-hidden="true" className="size-5" />
          </span>
          <AlertDialogTitle className="text-h2">
            {total === 1
              ? "Delete 1 message?"
              : `Delete all ${total} messages?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Public answers go with them. You&apos;ll have 10 seconds to undo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">
            Keep them
          </AlertDialogCancel>
          <Button
            className="rounded-full"
            onClick={onConfirm}
            variant="destructive"
          >
            Delete all
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
