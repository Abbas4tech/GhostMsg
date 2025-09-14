"use client";
import React from "react";
import axios from "axios";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";

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
  onMessageDelete: (_id: string) => void;
}

const MessageCard = ({ message }: MessageCardProps): React.JSX.Element => {
  const handleDeleteConfirm = async (): Promise<void> => {
    const response = await axios.delete<ApiResponse>(
      `/api/delete-message/${message._id}`
    );

    toast(response.data.message);
  };

  return (
    <Card className="w-full rounded-sm">
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
              <Button variant={"destructive"}>
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
                <Button onClick={handleDeleteConfirm}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
    </Card>
  );
};

export default MessageCard;
