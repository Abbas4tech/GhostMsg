"use client";

import { Loader2, MessageSquare, Send, Sparkles, X } from "lucide-react";
import type React from "react";
import { Button } from "@/components/elements/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/elements/dialog";
import { LiquidButton } from "@/components/elements/liquid-button";
import { Switch } from "@/components/elements/switch";
import { Textarea } from "@/components/elements/textarea";
import type { MessageDto } from "@/types/api";

export type SmartReplyTone = "witty" | "wholesome" | "thoughtful";

export const REPLY_MAX_LENGTH = 1000;

export interface SmartReplyModalProps {
  isGenerating?: boolean;
  isOpen: boolean;
  isPublished: boolean;
  isSaving?: boolean;
  message: MessageDto | null;
  onClose: () => void;
  onGenerate: (tone: SmartReplyTone) => void;
  onPublishedChange: (isPublished: boolean) => void;
  onReplyTextChange: (text: string) => void;
  onSave: () => void;
  replyText: string;
}

const TONE_OPTIONS: { label: string; tone: SmartReplyTone }[] = [
  { tone: "witty", label: "🔥 Witty Roast" },
  { tone: "wholesome", label: "💖 Wholesome" },
  { tone: "thoughtful", label: "🤔 Thoughtful" },
];

export const SmartReplyModal = ({
  isOpen,
  message,
  replyText,
  isPublished,
  isGenerating = false,
  isSaving = false,
  onClose,
  onGenerate,
  onReplyTextChange,
  onPublishedChange,
  onSave,
}: SmartReplyModalProps): React.JSX.Element | null => {
  if (!message) {
    return null;
  }

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
            {isGenerating && (
              <span className="flex items-center gap-1 text-purple-700 text-xs dark:text-purple-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map(({ tone, label }) => (
              <Button
                className="text-xs"
                disabled={isGenerating}
                key={tone}
                onClick={() => onGenerate(tone)}
                size="sm"
                variant="outline"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Reply Textarea */}
        <div className="space-y-2">
          <Textarea
            className="min-h-[110px] resize-none"
            maxLength={REPLY_MAX_LENGTH}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder="Type your reply here..."
            value={replyText}
          />
          <div className="flex justify-end text-muted-foreground text-xs">
            {replyText.length} / {REPLY_MAX_LENGTH}
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
            onCheckedChange={onPublishedChange}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <LiquidButton
            disabled={!replyText.trim() || isSaving}
            onClick={onSave}
          >
            {isSaving ? (
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

export default SmartReplyModal;
