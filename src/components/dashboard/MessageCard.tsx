"use client";
import React, { useState, useTransition, MouseEvent } from "react";
import { Loader2, X } from "lucide-react";

import { Message } from "@/model/User";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "../ui/card";
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
import { LiquidButton } from "../animate-ui/components/buttons/liquid";
import { Button } from "../animate-ui/components/buttons/button";

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
    e.stopPropagation()
    if (isPending) return;
    startTransition(async () => {
      await onDelete(message);
      setIsOpen(false);
    });
  };

  return (
    <Card className="w-full shadow-2xs rounded-sm">
      <CardHeader>
        <CardTitle className="text-base md:text-lg font-semibold">
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
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive">
                <X />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent from="left" className="sm:max-w-md">
              <AlertDialogHeader className="gap-4">
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action can't be undone and will permanently delete this
                  message from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                <LiquidButton disabled={isPending} variant={"destructive"} onClick={handleDeleteConfirm}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>  Deleting...</span>
                    </>
                  ) : (
                    <>
                      Delete
                    </>
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
