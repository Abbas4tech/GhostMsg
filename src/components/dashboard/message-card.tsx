"use client";
import { Loader2, X } from "lucide-react";
import type React from "react";
import { type MouseEvent, useState, useTransition } from "react";

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
  onDelete: (message: Message) => Promise<void>;
}

const MessageCard = ({
  message,
  onDelete,
}: MessageCardProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDeleteConfirm = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) {
      return;
    }
    startTransition(async () => {
      await onDelete(message);
      setIsOpen(false);
    });
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
            <AlertDialogContent className="sm:max-w-md" from="left">
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
