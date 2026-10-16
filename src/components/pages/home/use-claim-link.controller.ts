"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useIsClient } from "usehooks-ts";
import { buildClaimHref, buildLinkPrefix } from "./home.utils";

/** Landing "claim your link" form: holds the username and opens sign-up with it. */
export function useClaimLinkController() {
  const router = useRouter();
  const isClient = useIsClient();
  const [username, setUsername] = useState("");

  const handleSubmit = useCallback(() => {
    router.push(buildClaimHref(username));
  }, [router, username]);

  return {
    handleSubmit,
    linkPrefix: buildLinkPrefix(isClient ? window.location.host : undefined),
    setUsername,
    username,
  };
}
