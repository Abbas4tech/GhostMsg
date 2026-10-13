/** The `new_message` SSE payload fields the toast cares about. */
export interface LiveMessageEvent {
  content?: string;
  isQuarantined?: boolean;
}

export interface LiveMessageToast {
  description?: string;
  title: string;
}

const PREVIEW_LENGTH = 40;

export const LIVE_TOAST_TITLE = "New anonymous message received! 👻";
export const HIDDEN_LIVE_TOAST_TITLE = "New Anonymous Message 👻";

/**
 * What the in-app toast may say about a live message (Chapter 17, S3/S7):
 * nothing for a quarantined message, no text when the recipient hides
 * message text in notifications, otherwise a short preview.
 */
export function buildLiveMessageToast(
  message: LiveMessageEvent,
  hideMessageText: boolean
): LiveMessageToast | null {
  if (message.isQuarantined) {
    return null;
  }
  if (hideMessageText || !message.content) {
    return { title: HIDDEN_LIVE_TOAST_TITLE };
  }
  const { content } = message;
  return {
    title: LIVE_TOAST_TITLE,
    description:
      content.length > PREVIEW_LENGTH
        ? `${content.slice(0, PREVIEW_LENGTH)}…`
        : content,
  };
}
