"use client";

import { Loader2, MessageSquare, Send, Sparkles, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useReplyMessageMutation } from "@/hooks/mutations/use-reply-message-mutation";
import { useSmartReplyMutation } from "@/hooks/mutations/use-smart-reply-mutation";
import type { Message } from "@/model/user.model";

interface SmartReplyModalProps {
  isOpen: boolean;
  message: Message | null;
  onClose: () => void;
}

export const SmartReplyModal = ({
  isOpen,
  message,
  onClose,
}: SmartReplyModalProps): React.JSX.Element | null => {
  const [replyText, setReplyText] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const replyMutation = useReplyMessageMutation();
  const smartReplyMutation = useSmartReplyMutation();

  useEffect(() => {
    if (message) {
      setReplyText(message.reply?.text || "");
      setIsPublished(Boolean(message.reply?.isPublished ?? true));
    }
  }, [message]);

  if (!message) {
    return null;
  }

  const handleGenerateAI = async (
    tone: "witty" | "wholesome" | "thoughtful"
  ) => {
    try {
      const res = await smartReplyMutation.mutateAsync({
        content: message.content,
        tone,
      });
      if (res?.reply) {
        setReplyText(res.reply);
      }
    } catch {
      // Handled by toast
    }
  };

  const handleSaveReply = async () => {
    if (!replyText.trim()) {
      return;
    }
    try {
      await replyMutation.mutateAsync({
        messageId: String(message._id),
        text: replyText.trim(),
        isPublished,
      });
      onClose();
    } catch {
      // Handled by toast
    }
  };

  return (
    <Dialog onOpenChange={(open: boolean) => !open && onClose()} open={isOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            Reply &amp; Public Q&amp;A
          </DialogTitle>
          <DialogDescription>
            Author a reply to this anonymous confession or question.
          </DialogDescription>
        </DialogHeader>

        {/* Original Anonymous Message Box */}
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="font-medium text-foreground text-sm">
            &ldquo;{message.content}&rdquo;
          </p>
          <span className="mt-1 block text-muted-foreground text-xs">
            Received{" "}
            {new Date(message.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* AI Tone Generation Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-medium text-xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" /> AI
              Suggestions:
            </span>
            {smartReplyMutation.isPending && (
              <span className="flex items-center gap-1 text-purple-500 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="text-xs"
              disabled={smartReplyMutation.isPending}
              onClick={() => handleGenerateAI("witty")}
              size="sm"
              variant="outline"
            >
              🔥 Witty Roast
            </Button>
            <Button
              className="text-xs"
              disabled={smartReplyMutation.isPending}
              onClick={() => handleGenerateAI("wholesome")}
              size="sm"
              variant="outline"
            >
              💖 Wholesome
            </Button>
            <Button
              className="text-xs"
              disabled={smartReplyMutation.isPending}
              onClick={() => handleGenerateAI("thoughtful")}
              size="sm"
              variant="outline"
            >
              🤔 Thoughtful
            </Button>
          </div>
        </div>

        {/* Reply Textarea */}
        <div className="space-y-2">
          <Textarea
            className="min-h-[110px] resize-none"
            maxLength={1000}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply here..."
            value={replyText}
          />
          <div className="flex justify-end text-muted-foreground text-xs">
            {replyText.length} / 1000
          </div>
        </div>

        {/* Public Showcase Switch */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <label
              className="cursor-pointer font-medium text-sm"
              htmlFor="publish-switch"
            >
              Publish to Public Profile Showcase
            </label>
            <p className="text-muted-foreground text-xs">
              Visitors on your public profile link will be able to read this
              Q&amp;A.
            </p>
          </div>
          <Switch
            checked={isPublished}
            id="publish-switch"
            onCheckedChange={setIsPublished}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <LiquidButton
            disabled={!replyText.trim() || replyMutation.isPending}
            onClick={handleSaveReply}
          >
            {replyMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Save Reply
              </>
            )}
          </LiquidButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
