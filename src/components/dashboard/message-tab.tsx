import { MessageSquare, RefreshCw } from "lucide-react";
import type React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Message } from "@/model/user.model";
import { LiquidButton } from "../animate-ui/components/buttons/liquid";
import MessageCard from "./message-card";

interface MessageTabProps {
  isRefreshing: boolean;
  messages: Message[];
  onDelete: (_message: Message) => Promise<void>;
  onRefresh: () => void;
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
      <LiquidButton
        className="gap-0"
        disabled={isRefreshing}
        onClick={onRefresh}
      >
        <RefreshCw
          className={cn("h-4 w-4", isRefreshing ? "animate-spin" : "")}
        />
        <span className="ml-2">Refresh</span>
      </LiquidButton>
    </CardHeader>
    <CardContent>
      {messages.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {messages.map((message) => (
            <MessageCard
              key={message._id as string}
              message={message}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 font-medium text-lg">No messages yet</h3>
          <p className="mb-4 text-gray-500">
            Share your profile link to start receiving messages
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);
