"use client";

import { Loader2, X } from "lucide-react";
import type React from "react";
import { type MouseEvent, useState } from "react";
import { useDeleteMessageMutation } from "@/hooks/mutations/use-delete-message-mutation";
import type { Message } from "@/model/user.model";
import { Button } from "../animate-ui/components/buttons/button";
import { LiquidButton } from "../animate-ui/components/buttons/liquid";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../animate-ui/components/radix/alert-dialog";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface MessageCardProps {
  message: Message;
  onDelete?: (message: Message) => Promise<void>;
}

const MessageCard = ({
  message,
  onDelete,
}: MessageCardProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const deleteMutation = useDeleteMessageMutation();

  const isPending = deleteMutation.isPending;

  const handleDeleteConfirm = async (
    e: MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) {
      return;
    }

    try {
      if (onDelete) {
        await onDelete(message);
      } else {
        await deleteMutation.mutateAsync(String(message._id));
      }
      setIsOpen(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Card className="w-full rounded-sm shadow-2xs">
      <CardHeader>
        <CardTitle className="font-semibold text-base md:text-lg">
          {message.content}
        </CardTitle>
        <CardDescription>
          {new Date(message.createdAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          })}
        </CardDescription>
        <CardAction>
          <AlertDialog onOpenChange={setIsOpen} open={isOpen}>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive">
                <X />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader className="gap-4">
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action can't be undone and will permanently delete this
                  message from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancel
                </AlertDialogCancel>
                <LiquidButton
                  disabled={isPending}
                  onClick={handleDeleteConfirm}
                  variant={"destructive"}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span> Deleting...</span>
                    </>
                  ) : (
                    <>Delete</>
                  )}
                </LiquidButton>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardAction>
      </CardHeader>
    </Card>
  );
};

export default MessageCard;
