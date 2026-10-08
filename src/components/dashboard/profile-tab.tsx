"use client";

import { LinkIcon, Loader2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useIsClient } from "usehooks-ts";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAmaPromptMutation } from "@/hooks/mutations/use-ama-prompt-mutation";
import { CopyButton } from "../animate-ui/components/buttons/copy";

export const ProfileTab = (): React.JSX.Element => {
  const { data: session } = useSession();
  const isClient = useIsClient();
  const [amaPrompt, setAmaPrompt] = useState(
    "Send me an anonymous message, confession, or question!"
  );

  const amaMutation = useAmaPromptMutation();

  const baseUrl = useMemo(
    () => (isClient ? window.location.origin : ""),
    [isClient]
  );
  const profileUrl = useMemo(
    () => `${baseUrl}/u/${session?.user?.username || ""}`,
    [baseUrl, session?.user?.username]
  );

  const copyToClipboard = useCallback(() => {
    toast.success("Profile link copied to clipboard!");
  }, []);

  const handleSaveAmaPrompt = async () => {
    if (!amaPrompt.trim()) {
      return;
    }
    try {
      await amaMutation.mutateAsync(amaPrompt.trim());
    } catch {
      // Handled by toast
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile URL Sharing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile Link</CardTitle>
          <CardDescription>
            Share this link on Instagram, Snapchat, WhatsApp, or X to receive
            anonymous messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input className="flex-grow" disabled value={profileUrl} />
            <CopyButton content={profileUrl} onClick={copyToClipboard} />
          </div>
          <div className="flex items-center text-muted-foreground text-sm">
            <LinkIcon className="mr-2 h-4 w-4" />
            Anyone with this link can send you anonymous messages without
            registering.
          </div>
        </CardContent>
      </Card>

      {/* Custom AMA Prompt Banner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Custom Profile Topic / AMA Banner
          </CardTitle>
          <CardDescription>
            Set a custom prompt or question displayed at the top of your public
            profile to inspire visitors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              maxLength={120}
              onChange={(e) => setAmaPrompt(e.target.value)}
              placeholder="e.g., Ask me anything about my job, roast me, or share a secret!"
              value={amaPrompt}
            />
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>
                Try prompts like: "Compliment or roast me", "Ask me anything
                about tech"
              </span>
              <span>{amaPrompt.length} / 120</span>
            </div>
          </div>

          <LiquidButton
            disabled={!amaPrompt.trim() || amaMutation.isPending}
            onClick={handleSaveAmaPrompt}
          >
            {amaMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Topic Banner"
            )}
          </LiquidButton>
        </CardContent>
      </Card>
    </div>
  );
};
