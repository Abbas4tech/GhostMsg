"use client";

import { CheckCheck, Download, Star, Trash2, X } from "lucide-react";
import type React from "react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { useBulkActionMutation } from "@/hooks/mutations/use-bulk-action-mutation";
import type { Message } from "@/model/user.model";

interface BulkActionToolbarProps {
  allMessages: Message[];
  onClearSelection: () => void;
  selectedIds: string[];
}

export const BulkActionToolbar = ({
  selectedIds,
  onClearSelection,
  allMessages,
}: BulkActionToolbarProps): React.JSX.Element | null => {
  const bulkMutation = useBulkActionMutation();

  if (selectedIds.length === 0) {
    return null;
  }

  const handleBulkAction = async (action: "delete" | "read" | "star") => {
    try {
      await bulkMutation.mutateAsync({
        action,
        ids: selectedIds,
      });
      onClearSelection();
    } catch {
      // Handled by toast
    }
  };

  const handleExportJSON = () => {
    const selectedMessages = allMessages.filter((m) =>
      selectedIds.includes(String(m._id))
    );
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(selectedMessages, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `ghostmsg-export-${Date.now()}.json`
    );
    downloadAnchor.click();
  };

  const handleExportCSV = () => {
    const selectedMessages = allMessages.filter((m) =>
      selectedIds.includes(String(m._id))
    );
    const headers = ["ID", "Content", "Sentiment", "Created At", "Reply"];
    const rows = selectedMessages.map((m) => [
      String(m._id),
      `"${m.content.replace(/"/g, '""')}"`,
      m.sentimentTag || "neutral",
      new Date(m.createdAt).toISOString(),
      m.reply?.text ? `"${m.reply.text.replace(/"/g, '""')}"` : '""',
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute(
      "download",
      `ghostmsg-export-${Date.now()}.csv`
    );
    downloadAnchor.click();
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-background/95 px-4 py-2.5 shadow-2xl backdrop-blur-md">
      <span className="font-semibold text-muted-foreground text-xs">
        {selectedIds.length} selected
      </span>

      <div className="h-4 w-px bg-border" />

      <Button
        className="h-7 text-xs"
        disabled={bulkMutation.isPending}
        onClick={() => handleBulkAction("read")}
        size="sm"
        variant="ghost"
      >
        <CheckCheck className="mr-1 h-3.5 w-3.5 text-blue-500" /> Read
      </Button>

      <Button
        className="h-7 text-xs"
        disabled={bulkMutation.isPending}
        onClick={() => handleBulkAction("star")}
        size="sm"
        variant="ghost"
      >
        <Star className="mr-1 h-3.5 w-3.5 text-yellow-500" /> Star
      </Button>

      <Button
        className="h-7 text-xs"
        onClick={handleExportCSV}
        size="sm"
        variant="ghost"
      >
        <Download className="mr-1 h-3.5 w-3.5" /> CSV
      </Button>

      <Button
        className="h-7 text-xs"
        onClick={handleExportJSON}
        size="sm"
        variant="ghost"
      >
        <Download className="mr-1 h-3.5 w-3.5" /> JSON
      </Button>

      <Button
        className="h-7 text-destructive text-xs hover:bg-destructive/10"
        disabled={bulkMutation.isPending}
        onClick={() => handleBulkAction("delete")}
        size="sm"
        variant="ghost"
      >
        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
      </Button>

      <div className="h-4 w-px bg-border" />

      <Button
        className="h-6 w-6 p-0"
        onClick={onClearSelection}
        size="icon"
        variant="ghost"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
