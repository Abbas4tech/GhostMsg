"use client";

import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { useIsClient } from "usehooks-ts";
import { notify } from "@/components/elements/sonner";
import { stripProtocol } from "./dashboard.utils";
import { buildProfileUrl } from "./profile.utils";

/**
 * The signed-in recipient's Public Profile Link plus copy / native-share
 * actions, shared by the sidebar, the Profile page and the empty inbox.
 * `usernameOverride` serves a recipient who isn't signed in yet (the
 * verified screen on /verify).
 */
export function useProfileLinkController(usernameOverride?: string) {
  const { data: session } = useSession();
  const isClient = useIsClient();
  const username = usernameOverride ?? session?.user?.username ?? "";

  const profileUrl = useMemo(
    () => buildProfileUrl(isClient ? window.location.origin : "", username),
    [isClient, username]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      notify.success("Link copied");
    } catch {
      notify.error("Couldn't copy. Press and hold the link to copy it.");
    }
  }, [profileUrl]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.share({
        title: "Send me an Anonymous Message",
        url: profileUrl,
      });
    } catch {
      // Share sheet dismissed: nothing to do.
    }
  }, [profileUrl]);

  const canShare = isClient && typeof navigator.share === "function";

  return {
    handleCopy,
    handleShare: canShare ? handleShare : undefined,
    profileLabel: stripProtocol(profileUrl),
    profileUrl,
    username,
  };
}
