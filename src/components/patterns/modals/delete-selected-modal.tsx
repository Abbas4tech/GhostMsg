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

export interface DeleteSelectedModalProps {
  /** How many selected messages will go. */
  count: number;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  /** How many of them have a public answer (those answers go too). */
  publicAnswerCount: number;
}

const describePublicAnswers = (count: number, publicCount: number): string => {
  if (publicCount === 0) {
    return "";
  }
  if (count === 1) {
    return "It has a public answer on your profile, so that answer goes too. ";
  }
  return publicCount === 1
    ? "One has a public answer on your profile, so that answer goes too. "
    : `${publicCount} have public answers on your profile, so those answers go too. `;
};

/** Bulk delete confirm (design MobAlertDelete): asks first, then deletes at once (no Undo). */
export function DeleteSelectedModal({
  open,
  onOpenChange,
  count,
  publicAnswerCount,
  onConfirm,
}: DeleteSelectedModalProps): React.JSX.Element {
  const noun = count === 1 ? "message" : "messages";

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent className="rounded-2xl shadow-lift sm:max-w-md">
        <AlertDialogHeader className="gap-3 text-left sm:text-left">
          <span className="grid size-12 place-items-center rounded-2xl bg-[color-mix(in_oklch,var(--destructive)_14%,var(--card))] text-destructive">
            <Trash2Icon aria-hidden="true" className="size-[22px]" />
          </span>
          <AlertDialogTitle className="text-h3">
            Delete {count} {noun}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body">
            {describePublicAnswers(count, publicAnswerCount)}
            This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full max-sm:h-13 max-sm:text-body">
            {count === 1 ? "Keep it" : "Keep them"}
          </AlertDialogCancel>
          <Button
            className="rounded-full max-sm:h-13 max-sm:text-body"
            onClick={onConfirm}
            variant="destructive"
          >
            Delete {count}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
