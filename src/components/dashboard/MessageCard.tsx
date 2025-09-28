"use client";
import React, { useTransition } from "react";
import { Loader2, X } from "lucide-react";

import { Message } from "@/model/User";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface MessageCardProps {
  message: Message;
  onDelete: (_message: Message) => Promise<void>;
}

const MessageCard = ({
  message,
  onDelete,
}: MessageCardProps): React.JSX.Element => {
  const [isPending, startTransition] = useTransition();

  const handleDeleteConfirm = (): void =>
    startTransition(async () => await onDelete(message));

  return (
    <Card className="w-full shadow-2xs rounded-sm">
      <CardHeader>
        <CardTitle className="text-base md:text-lg font-semibold">
          {message.content}
        </CardTitle>
        <CardDescription>
          {new Date(message.createdAt).toLocaleString("en-In", {
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
          <Dialog>
            <DialogTrigger asChild>
              <Button size={"icon"} variant={"destructive"}>
                <X />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="gap-4">
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action can&#39;t be undone and will permanently delete
                  this message from our servers
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  disabled={isPending}
                  variant={"destructive"}
                  onClick={handleDeleteConfirm}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
    </Card>
  );
};

export default MessageCard;
