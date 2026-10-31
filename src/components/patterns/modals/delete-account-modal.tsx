"use client";

import type React from "react";
import { useCallback, useId } from "react";
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
import { Field, FieldLabel } from "@/components/elements/field";
import { Input } from "@/components/elements/input";
import { Spinner } from "@/components/elements/spinner";

export interface DeleteAccountModalProps {
  confirmValue: string;
  isPending?: boolean;
  onConfirm: () => void;
  onConfirmValueChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  username: string;
}

/** Delete account and link: the user types their username to confirm. */
export function DeleteAccountModal({
  open,
  onOpenChange,
  username,
  confirmValue,
  onConfirmValueChange,
  isPending = false,
  onConfirm,
}: DeleteAccountModalProps): React.JSX.Element {
  const inputId = useId();
  const matches = confirmValue.trim() === username;
  const handleConfirmValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onConfirmValueChange(event.target.value);
    },
    [onConfirmValueChange]
  );

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent className="rounded-2xl shadow-lift sm:max-w-md">
        <AlertDialogHeader className="text-left sm:text-left">
          <AlertDialogTitle className="text-h3">
            Delete your account?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Your link, every message and every public answer are deleted. This
            can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor={inputId}>
            Type <b className="font-semibold text-destructive">{username}</b> to
            confirm
          </FieldLabel>
          <Input
            autoCapitalize="none"
            autoComplete="off"
            className="h-11"
            id={inputId}
            onChange={handleConfirmValueChange}
            spellCheck={false}
            value={confirmValue}
          />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            className="rounded-full"
            disabled={!matches || isPending}
            onClick={onConfirm}
            variant="destructive"
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Delete account
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
