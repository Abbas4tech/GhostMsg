"use client";

import { MessageSquare, Search, ShieldAlert, Star } from "lucide-react";
import type React from "react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";

export type MessageFilterStatus =
  | "all"
  | "unread"
  | "starred"
  | "quarantined"
  | "answered";

interface MessageFilterBarProps {
  activeStatus: MessageFilterStatus;
  counts?: {
    all: number;
    unread: number;
    starred: number;
    quarantined: number;
    answered: number;
  };
  onSearchChange: (search: string) => void;
  onStatusChange: (status: MessageFilterStatus) => void;
  searchQuery: string;
}

export const MessageFilterBar = ({
  activeStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  counts,
}: MessageFilterBarProps): React.JSX.Element => {
  return (
    <div className="flex flex-col gap-3 py-2">
      {/* Full-width Search Input */}
      <div className="relative w-full">
        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="h-9 w-full pl-8 text-sm"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search messages..."
          value={searchQuery}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
        <Button
          className="h-7 rounded-full text-xs"
          onClick={() => onStatusChange("all")}
          size="sm"
          variant={activeStatus === "all" ? "default" : "outline"}
        >
          All {counts ? `(${counts.all})` : ""}
        </Button>
        <Button
          className="h-7 rounded-full text-xs"
          onClick={() => onStatusChange("unread")}
          size="sm"
          variant={activeStatus === "unread" ? "default" : "outline"}
        >
          Unread {counts ? `(${counts.unread})` : ""}
        </Button>
        <Button
          className="h-7 rounded-full text-xs"
          onClick={() => onStatusChange("starred")}
          size="sm"
          variant={activeStatus === "starred" ? "default" : "outline"}
        >
          <Star className="mr-1 h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
          Starred {counts ? `(${counts.starred})` : ""}
        </Button>
        <Button
          className="h-7 rounded-full text-xs"
          onClick={() => onStatusChange("answered")}
          size="sm"
          variant={activeStatus === "answered" ? "default" : "outline"}
        >
          <MessageSquare className="mr-1 h-3.5 w-3.5 text-purple-400" />
          Answered {counts ? `(${counts.answered})` : ""}
        </Button>
        {Boolean(counts?.quarantined) && (
          <Button
            className="h-7 rounded-full text-xs"
            onClick={() => onStatusChange("quarantined")}
            size="sm"
            variant={activeStatus === "quarantined" ? "destructive" : "outline"}
          >
            <ShieldAlert className="mr-1 h-3.5 w-3.5" />
            Quarantined ({counts?.quarantined})
          </Button>
        )}
      </div>
    </div>
  );
};
