"use client";
import React, { useState } from "react";
import { Loader2, X } from "lucide-react";

import { Message } from "@/model/User";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface MessageCardProps {
  message: Message;
  onDelete: (_message: Message) => Promise<void>; // Add this
}

const MessageCard = ({
  message,
  onDelete,
}: MessageCardProps): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteConfirm = async (): Promise<void> => {
    setIsLoading(true);
    await onDelete(message);
    setIsLoading(false);
  };

  return (
    <Card className="w-full shadow-2xs rounded-sm">
      <CardHeader>
        <CardTitle className="text-base md:text-lg font-bold">
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
              <DialogHeader>
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
                  disabled={isLoading}
                  variant={"destructive"}
                  onClick={handleDeleteConfirm}
                >
                  {isLoading ? (
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
