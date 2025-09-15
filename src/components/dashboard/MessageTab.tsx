import React from "react";
import { MessageSquare, RefreshCw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Message } from "@/model/User";
import MessageCard from "@/components/MessageCard";

interface MessageTabProps {
  messages: Message[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onDelete: (_messageId: string) => void;
}

export const MessageTab = ({
  messages,
  isRefreshing,
  onRefresh,
  onDelete,
}: MessageTabProps): React.JSX.Element => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Your Messages</CardTitle>
        <CardDescription className="mt-1">
          {messages.length > 0
            ? `You have ${messages.length} message${messages.length !== 1 ? "s" : ""}`
            : "You haven't received any messages yet"}
        </CardDescription>
      </div>
      <Button
        className="gap-0"
        variant="outline"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        <span className="ml-2">Refresh</span>
      </Button>
    </CardHeader>
    <CardContent>
      {messages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {messages.map((message) => (
            <MessageCard
              key={message.content}
              message={message}
              onMessageDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-gray-500 mb-4">
            Share your profile link to start receiving messages
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);
