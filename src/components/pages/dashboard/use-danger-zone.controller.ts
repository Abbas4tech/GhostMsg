"use client";

import { Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { notify } from "@/components/elements/sonner";
import { showUndoToast } from "@/components/patterns/undo-toast";
import { useDeleteAllMessagesMutation } from "@/data/messages/use-delete-all-messages-mutation";
import { useDeleteAccountMutation } from "@/data/user/use-delete-account-mutation";

/** Time the "Messages deleted" toast offers Undo before the request runs. */
export const DELETE_ALL_UNDO_MS = 10_000;

/**
 * Danger zone: "Delete all" holds the API call behind a 10 s Undo toast and
 * sends it when the toast closes without Undo (or at once if the page
 * unmounts); "Delete account" needs the typed username, then signs out.
 */
export function useDangerZoneController(username: string) {
  const deleteAllMutation = useDeleteAllMessagesMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");

  const pendingToastRef = useRef<number | string | null>(null);
  const { mutate: deleteAll } = deleteAllMutation;

  const commitDeleteAll = useCallback(() => {
    if (pendingToastRef.current !== null) {
      pendingToastRef.current = null;
      deleteAll();
    }
  }, [deleteAll]);

  // Leaving the page doesn't cancel a confirmed delete; it commits it and
  // takes the Undo toast down with it.
  useEffect(
    () => () => {
      const toastId = pendingToastRef.current;
      commitDeleteAll();
      if (toastId !== null) {
        toast.dismiss(toastId);
      }
    },
    [commitDeleteAll]
  );

  const handleUndoDeleteAll = useCallback(() => {
    pendingToastRef.current = null;
    notify.success("Nothing was deleted");
  }, []);

  const handleConfirmDeleteAll = useCallback(() => {
    setIsDeleteAllOpen(false);
    pendingToastRef.current = showUndoToast({
      durationMs: DELETE_ALL_UNDO_MS,
      icon: createElement(Trash2),
      message: "Deleting all messages…",
      onCommit: commitDeleteAll,
      onUndo: handleUndoDeleteAll,
    });
  }, [commitDeleteAll, handleUndoDeleteAll]);

  const { mutateAsync: deleteAccount } = deleteAccountMutation;
  const handleConfirmDeleteAccount = useCallback(async () => {
    try {
      await deleteAccount(confirmValue.trim());
      await signOut({ callbackUrl: "/" });
    } catch {
      // Toasted by the mutation
    }
  }, [deleteAccount, confirmValue]);

  const openDeleteAccount = useCallback(() => {
    setConfirmValue("");
    setIsDeleteAccountOpen(true);
  }, []);

  return {
    confirmValue,
    handleConfirmDeleteAccount,
    handleConfirmDeleteAll,
    isDeleteAccountOpen,
    isDeleteAllOpen,
    isDeletingAccount: deleteAccountMutation.isPending,
    openDeleteAccount,
    openDeleteAll: () => setIsDeleteAllOpen(true),
    setConfirmValue,
    setIsDeleteAccountOpen,
    setIsDeleteAllOpen,
    username,
  };
}
