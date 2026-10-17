"use client";

import { Download, Link2, Share2, ShieldCheck } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/elements/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/elements/dialog";
import { Switch } from "@/components/elements/switch";
import { cn } from "@/lib/utils";
import type { MessageDto } from "@/types/api";
import {
  drawStoryCard,
  readStoryCardTheme,
  type StoryCardFormat,
  type StoryCardLook,
} from "./story-card.canvas";

export interface StoryCardModalProps {
  isOpen: boolean;
  message: MessageDto | null;
  onClose: () => void;
  /** "Copy link to this Q&A" (hidden when not provided). */
  onCopyLink?: () => void;
  /** Footer link on the card, without protocol. */
  profileLabel?: string;
  username: string;
}

const SENTIMENT_LABELS: Record<string, string> = {
  advice: "💡 Advice",
  curious: "🤔 Curious",
  neutral: "👻 Note",
  spicy: "🔥 Spicy",
  sweet: "💖 Sweet",
};

const FORMATS: { label: string; value: StoryCardFormat }[] = [
  { label: "Story 9:16", value: "story" },
  { label: "Square 1:1", value: "square" },
];

const LOOKS: { label: string; value: StoryCardLook }[] = [
  { label: "Gradient", value: "gradient" },
  { label: "Plain", value: "plain" },
];

function SegmentedOption<T extends string>({
  option,
  isActive,
  onChange,
}: {
  isActive: boolean;
  onChange: (value: T) => void;
  option: { label: string; value: T };
}): React.JSX.Element {
  const handleClick = useCallback(() => {
    onChange(option.value);
  }, [onChange, option]);

  return (
    <button
      aria-pressed={isActive}
      className={cn(
        "min-h-10 rounded-full font-semibold text-muted-foreground text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring",
        isActive && "bg-card text-foreground shadow-soft"
      )}
      onClick={handleClick}
      type="button"
    >
      {option.label}
    </button>
  );
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
  value: T;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold text-sm">{label}</span>
      <fieldset
        aria-label={label}
        className="grid grid-cols-2 rounded-full border bg-muted p-[3px]"
      >
        {options.map((option) => (
          <SegmentedOption
            isActive={value === option.value}
            key={option.value}
            onChange={onChange}
            option={option}
          />
        ))}
      </fieldset>
    </div>
  );
}

function ToggleRow({
  id,
  title,
  hint,
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  hint: string;
  id: string;
  onCheckedChange: (checked: boolean) => void;
  title: string;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <label
          className="cursor-pointer font-semibold text-[15px]"
          htmlFor={id}
        >
          {title}
        </label>
        <p className="text-muted-foreground text-sm" id={`${id}-hint`}>
          {hint}
        </p>
      </div>
      <Switch
        aria-describedby={`${id}-hint`}
        checked={checked}
        id={id}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

/**
 * "Share as Story Card": live preview of the exported PNG plus format, look
 * and content toggles. Owns only local UI state; the sender is never shown.
 */
export const StoryCardModal = ({
  isOpen,
  message,
  username,
  profileLabel = `ghostmsg.app/u/${username}`,
  onClose,
  onCopyLink,
}: StoryCardModalProps): React.JSX.Element => {
  const [format, setFormat] = useState<StoryCardFormat>("story");
  const [look, setLook] = useState<StoryCardLook>("gradient");
  const [includeAnswer, setIncludeAnswer] = useState(true);
  const [showLink, setShowLink] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const answerSwitchId = useId();
  const linkSwitchId = useId();

  const answer = message?.reply?.text?.trim();
  const fileName = `ghostmsg-${username}-${format}.png`;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!(canvas && message)) {
      return;
    }
    const theme = readStoryCardTheme(document.documentElement);
    drawStoryCard(canvas, {
      ...theme,
      answer: includeAnswer ? answer : undefined,
      format,
      label: SENTIMENT_LABELS[message.sentimentTag ?? "neutral"],
      look,
      profileLabel: showLink ? profileLabel : null,
      question: message.content,
      username,
    });
  }, [
    message,
    format,
    look,
    includeAnswer,
    answer,
    showLink,
    profileLabel,
    username,
  ]);

  useEffect(() => {
    if (!(isOpen && message)) {
      return;
    }
    // Wait a frame so the dialog's canvas is mounted and fonts are applied.
    const frame = requestAnimationFrame(redraw);
    return () => cancelAnimationFrame(frame);
  }, [isOpen, message, redraw]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = fileName;
    link.click();
    toast.success("Story Card saved");
  }, [fileName]);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    const blob = canvas ? await canvasToBlob(canvas) : null;
    const file = blob
      ? new File([blob], fileName, { type: "image/png" })
      : null;
    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "GhostMsg Story Card" });
        return;
      } catch {
        // Share sheet dismissed: nothing to do.
        return;
      }
    }
    handleDownload();
  }, [fileName, handleDownload]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-bold text-[22px]">
            Share as Story Card
          </DialogTitle>
          <DialogDescription>
            What you see is the exact image you&apos;ll post.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex justify-center rounded-xl bg-muted p-3">
            <canvas
              aria-label="Story Card preview"
              className={cn(
                "w-auto rounded-2xl shadow-lift",
                format === "story" ? "h-[440px]" : "h-[300px]"
              )}
              ref={canvasRef}
              role="img"
            />
          </div>

          <div className="flex flex-col gap-4">
            <Segmented
              label="Format"
              onChange={setFormat}
              options={FORMATS}
              value={format}
            />
            <Segmented
              label="Look"
              onChange={setLook}
              options={LOOKS}
              value={look}
            />
            {answer ? (
              <ToggleRow
                checked={includeAnswer}
                hint="Off = message only"
                id={answerSwitchId}
                onCheckedChange={setIncludeAnswer}
                title="Include my answer"
              />
            ) : null}
            <ToggleRow
              checked={showLink}
              hint="Footer handle"
              id={linkSwitchId}
              onCheckedChange={setShowLink}
              title="Show my link"
            />
            <hr className="border-border" />
            <Button
              className="rounded-full"
              onClick={handleShare}
              size="xl"
              variant="brand"
            >
              <Share2 aria-hidden="true" />
              Share…
            </Button>
            <Button
              className="rounded-full"
              onClick={handleDownload}
              size="xl"
              variant="outline"
            >
              <Download aria-hidden="true" />
              Save image
            </Button>
            {onCopyLink ? (
              <Button
                className="rounded-full"
                onClick={onCopyLink}
                variant="ghost"
              >
                <Link2 aria-hidden="true" />
                Copy my link
              </Button>
            ) : null}
            <p className="flex items-start gap-2 text-muted-foreground text-sm">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              The sender is never shown. Only the message, your answer and your
              link.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
