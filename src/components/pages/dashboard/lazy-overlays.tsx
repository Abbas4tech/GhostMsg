"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useEffect } from "react";
import { useHasOpened } from "@/hooks/use-has-opened";
import { runWhenIdle } from "@/lib/browser/idle";

/**
 * Dashboard overlays that are heavy and rarely opened (ADR 0035, M7). Each
 * loader is shared by `dynamic()` and the idle prefetch, so the chunk is
 * already cached by the time the Recipient first opens it.
 *
 * Deep imports are deliberate: the modals barrel would pull every modal back
 * into the main chunk.
 */
const loadSmartReplyModal = () =>
  import("@/components/patterns/modals/smart-reply-modal").then(
    (module) => module.SmartReplyModal
  );
const loadStoryCardModal = () =>
  import("@/components/patterns/modals/story-card-modal").then(
    (module) => module.StoryCardModal
  );
const loadBlockSenderModal = () =>
  import("@/components/patterns/modals/block-sender-modal").then(
    (module) => module.BlockSenderModal
  );
const loadRevealMessageModal = () =>
  import("@/components/patterns/modals/reveal-message-modal").then(
    (module) => module.RevealMessageModal
  );
const loadCommandPalette = () =>
  import("@/components/patterns/command-palette").then(
    (module) => module.CommandPalette
  );
const loadShortcutSheet = () =>
  import("@/components/patterns/shortcut-sheet").then(
    (module) => module.ShortcutSheet
  );

export const LazySmartReplyModal = dynamic(loadSmartReplyModal, { ssr: false });
export const LazyStoryCardModal = dynamic(loadStoryCardModal, { ssr: false });
export const LazyBlockSenderModal = dynamic(loadBlockSenderModal, {
  ssr: false,
});
export const LazyRevealMessageModal = dynamic(loadRevealMessageModal, {
  ssr: false,
});
export const LazyCommandPalette = dynamic(loadCommandPalette, { ssr: false });
export const LazyShortcutSheet = dynamic(loadShortcutSheet, { ssr: false });

/** Warms the inbox modals once the browser is idle. */
export function usePrefetchInboxOverlays(): void {
  useEffect(
    () =>
      runWhenIdle(() => {
        loadSmartReplyModal();
        loadStoryCardModal();
        loadBlockSenderModal();
        loadRevealMessageModal();
      }),
    []
  );
}

/** Warms the command palette and shortcut sheet once the browser is idle. */
export function usePrefetchShellOverlays(): void {
  useEffect(
    () =>
      runWhenIdle(() => {
        loadCommandPalette();
        loadShortcutSheet();
      }),
    []
  );
}

export interface MountOnFirstOpenProps {
  children: ReactNode;
  open: boolean;
}

/** Renders `children` (a lazy overlay) only from the first time `open` is true. */
export function MountOnFirstOpen({
  children,
  open,
}: MountOnFirstOpenProps): ReactNode {
  return useHasOpened(open) ? children : null;
}
