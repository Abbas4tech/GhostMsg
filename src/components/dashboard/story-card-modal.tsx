"use client";

import { Check, Copy, Download, Sparkles } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Message } from "@/model/user.model";

interface StoryCardModalProps {
  isOpen: boolean;
  message: Message | null;
  onClose: () => void;
  username: string;
}

type StoryTheme = "midnight" | "cyberpunk" | "sunset" | "minimal";

interface ThemeConfig {
  accentColor: string;
  bubbleColor: string;
  cardBg: string;
  gradient: [string, string, string];
  name: string;
  textColor: string;
}

const THEMES: Record<StoryTheme, ThemeConfig> = {
  midnight: {
    name: "Midnight Violet",
    gradient: ["#0f0c29", "#302b63", "#24243e"],
    cardBg: "rgba(255, 255, 255, 0.08)",
    textColor: "#ffffff",
    accentColor: "#a855f7",
    bubbleColor: "#9333ea",
  },
  cyberpunk: {
    name: "Cyberpunk",
    gradient: ["#090d16", "#0f172a", "#020617"],
    cardBg: "rgba(15, 23, 42, 0.8)",
    textColor: "#00f0ff",
    accentColor: "#ff007f",
    bubbleColor: "#00f0ff",
  },
  sunset: {
    name: "Sunset Glow",
    gradient: ["#4c0519", "#831843", "#500724"],
    cardBg: "rgba(255, 255, 255, 0.12)",
    textColor: "#ffffff",
    accentColor: "#f43f5e",
    bubbleColor: "#fb7185",
  },
  minimal: {
    name: "Monochrome",
    gradient: ["#18181b", "#09090b", "#000000"],
    cardBg: "rgba(255, 255, 255, 0.05)",
    textColor: "#ffffff",
    accentColor: "#e4e4e7",
    bubbleColor: "#71717a",
  },
};

export const StoryCardModal = ({
  isOpen,
  message,
  username,
  onClose,
}: StoryCardModalProps): React.JSX.Element => {
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>("midnight");
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!(canvas && message)) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const theme = THEMES[selectedTheme];

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.gradient[0]);
    bgGrad.addColorStop(0.5, theme.gradient[1]);
    bgGrad.addColorStop(1, theme.gradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle background glowing orbs
    ctx.beginPath();
    ctx.arc(200, 300, 350, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
    ctx.filter = "blur(80px)";
    ctx.fill();
    ctx.filter = "none";

    ctx.beginPath();
    ctx.arc(880, 1600, 400, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(244, 63, 94, 0.12)";
    ctx.filter = "blur(100px)";
    ctx.fill();
    ctx.filter = "none";

    // 2. Top Ghost Brand Header
    ctx.fillStyle = theme.textColor;
    ctx.font = "bold 44px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("👻 GhostMsg", width / 2, 280);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "500 28px Poppins, sans-serif";
    ctx.fillText(`@${username}'s anonymous inbox`, width / 2, 340);

    // 3. Question Card Box (Rounded Rectangle)
    const cardX = 120;
    const cardY = 460;
    const cardWidth = 840;
    const cardHeight = 440;
    const radius = 36;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, radius);
    ctx.fillStyle = theme.cardBg;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Card Header Pill
    ctx.fillStyle = theme.bubbleColor;
    ctx.beginPath();
    ctx.roundRect(cardX + 40, cardY + 40, 240, 50, 25);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Anonymous Message", cardX + 160, cardY + 73);

    // Message Question Content (Word Wrapped)
    ctx.fillStyle = theme.textColor;
    ctx.font = "600 36px Poppins, sans-serif";
    ctx.textAlign = "left";

    const wrapText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number
    ) => {
      const words = text.split(" ");
      let line = "";
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = `${line}${words[n]} `;
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = `${words[n]} `;
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY;
    };

    wrapText(message.content, cardX + 50, cardY + 160, cardWidth - 100, 52);

    // 4. Recipient Reply Section (if available)
    if (message.reply?.text) {
      const replyX = 120;
      const replyY = 960;
      const replyWidth = 840;
      const replyHeight = 420;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(replyX, replyY, replyWidth, replyHeight, radius);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();
      ctx.strokeStyle = theme.accentColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = theme.accentColor;
      ctx.font = "bold 26px Poppins, sans-serif";
      ctx.fillText(`💬 @${username}'s Response:`, replyX + 50, replyY + 70);

      ctx.fillStyle = "#ffffff";
      ctx.font = "500 34px Poppins, sans-serif";
      wrapText(
        message.reply.text,
        replyX + 50,
        replyY + 140,
        replyWidth - 100,
        48
      );
    }

    // 5. Bottom Call-To-Action Badge
    const ctaY = 1620;
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 320, ctaY, 640, 90, 45);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Send me anonymous messages at:", width / 2, ctaY + 40);

    ctx.fillStyle = theme.accentColor;
    ctx.font = "600 26px Poppins, sans-serif";
    ctx.fillText(`ghostmsg.app/u/${username}`, width / 2, ctaY + 74);
  }, [message, selectedTheme, username]);

  useEffect(() => {
    if (isOpen && message) {
      setTimeout(drawCard, 50);
    }
  }, [isOpen, message, drawCard]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `ghostmsg-${username}-story.png`;
    link.click();
    toast.success("Story card downloaded!");
  };

  const handleCopyClipboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          return;
        }
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setIsCopied(true);
        toast.success(
          "Image copied to clipboard! Paste into Instagram Stories."
        );
        setTimeout(() => setIsCopied(false), 3000);
      });
    } catch {
      toast.error(
        "Clipboard copy not supported on this browser. Try download."
      );
    }
  };

  return (
    <Dialog onOpenChange={(open: boolean) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Social Story Card Generator
          </DialogTitle>
          <DialogDescription>
            Export a 9:16 high-resolution card formatted for Instagram &
            Snapchat Stories.
          </DialogDescription>
        </DialogHeader>

        {/* Theme Selector Chips */}
        <div className="flex flex-wrap gap-2 py-2">
          {(Object.keys(THEMES) as StoryTheme[]).map((themeKey) => (
            <Button
              className="text-xs"
              key={themeKey}
              onClick={() => setSelectedTheme(themeKey)}
              size="sm"
              variant={selectedTheme === themeKey ? "default" : "outline"}
            >
              {THEMES[themeKey].name}
            </Button>
          ))}
        </div>

        {/* Preview Canvas */}
        <div className="flex justify-center overflow-hidden rounded-xl border bg-black/50 p-2">
          <canvas
            className="h-[380px] w-auto rounded-lg shadow-2xl"
            ref={canvasRef}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <LiquidButton className="flex-1" onClick={handleCopyClipboard}>
            {isCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Copied Image!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" /> Copy for Instagram
              </>
            )}
          </LiquidButton>
          <Button onClick={handleDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
