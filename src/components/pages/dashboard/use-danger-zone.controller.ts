"use client";

import { signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDeleteAllMessagesMutation } from "@/data/messages/use-delete-all-messages-mutation";
import { useDeleteAccountMutation } from "@/data/user/use-delete-account-mutation";

/** Time the "Messages deleted" toast offers Undo before the request runs. */
export const DELETE_ALL_UNDO_MS = 10_000;

/**
 * Danger zone: "Delete all" waits 10 s with an Undo toast before calling the
 * API (and commits at once if the page unmounts); "Delete account" needs the
 * typed username, then signs out.
 */
export function useDangerZoneController(username: string) {
  const deleteAllMutation = useDeleteAllMessagesMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");

  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutate: deleteAll } = deleteAllMutation;

  const commitDeleteAll = useCallback(() => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current);
      pendingRef.current = null;
      deleteAll();
    }
  }, [deleteAll]);

  // Leaving the page doesn't cancel a confirmed delete; it commits it.
  useEffect(() => commitDeleteAll, [commitDeleteAll]);

  const handleConfirmDeleteAll = useCallback(() => {
    setIsDeleteAllOpen(false);
    pendingRef.current = setTimeout(commitDeleteAll, DELETE_ALL_UNDO_MS);
    toast("Deleting all messages…", {
      action: {
        label: "Undo",
        onClick: () => {
          if (pendingRef.current) {
            clearTimeout(pendingRef.current);
            pendingRef.current = null;
          }
          toast.success("Nothing was deleted");
        },
      },
      duration: DELETE_ALL_UNDO_MS,
    });
  }, [commitDeleteAll]);

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
