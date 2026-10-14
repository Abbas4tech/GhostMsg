"use client";

import { useCallback, useEffect, useState } from "react";

const isPlainLeftClick = (event: MouseEvent): boolean =>
  event.button === 0 &&
  !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

/** Same-origin link to another page (not a new tab, download or #anchor). */
function interceptedHref(event: MouseEvent): string | null {
  if (event.defaultPrevented || !isPlainLeftClick(event)) {
    return null;
  }
  const target = event.target instanceof Element ? event.target : null;
  const anchor = target?.closest<HTMLAnchorElement>("a[href]");
  if (
    !anchor ||
    anchor.target === "_blank" ||
    anchor.hasAttribute("download")
  ) {
    return null;
  }
  const url = new URL(anchor.href, window.location.href);
  const isSamePage =
    url.pathname === window.location.pathname &&
    url.search === window.location.search;
  if (url.origin !== window.location.origin || isSamePage) {
    return null;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Protects unsaved work. While `isDirty`, closing or reloading the tab shows
 * the browser's "leave site?" prompt, and clicking an in-app link is held as
 * `pendingHref` so the page can ask first (then navigate or stay).
 */
export function useLeaveGuard(isDirty: boolean) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    // Capture phase: runs before Next.js <Link> handles the click.
    const handleClick = (event: MouseEvent) => {
      const href = interceptedHref(event);
      if (href) {
        event.preventDefault();
        event.stopPropagation();
        setPendingHref(href);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty]);

  const clearPendingHref = useCallback(() => setPendingHref(null), []);

  return { pendingHref, clearPendingHref };
}
