"use client";

import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useIsClient } from "usehooks-ts";
import { DEFAULT_AMA_PROMPT } from "@/components/patterns/ama-banner";
import { useAmaPromptMutation } from "@/hooks/mutations/use-ama-prompt-mutation";

/** Profile tab state: shareable profile URL and the AMA banner editor. */
export function useProfileController() {
  const { data: session } = useSession();
  const isClient = useIsClient();
  const [amaPrompt, setAmaPrompt] = useState(DEFAULT_AMA_PROMPT);
  const amaMutation = useAmaPromptMutation();

  const profileUrl = useMemo(() => {
    const origin = isClient ? window.location.origin : "";
    return `${origin}/u/${session?.user?.username || ""}`;
  }, [isClient, session?.user?.username]);

  const handleCopyProfileUrl = useCallback(() => {
    toast.success("Profile link copied to clipboard!");
  }, []);

  const { mutateAsync } = amaMutation;
  const handleSaveAmaPrompt = useCallback(async () => {
    const trimmed = amaPrompt.trim();
    if (!trimmed) {
      return;
    }
    try {
      await mutateAsync(trimmed);
    } catch {
      // Handled by mutation toast
    }
  }, [amaPrompt, mutateAsync]);

  return {
    profileUrl,
    handleCopyProfileUrl,
    amaPrompt,
    setAmaPrompt,
    handleSaveAmaPrompt,
    isSavingAmaPrompt: amaMutation.isPending,
  };
}
