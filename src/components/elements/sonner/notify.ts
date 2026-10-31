import { type ExternalToast, toast } from "sonner";

/** Design Feedback board: success 3 s, info / warning 5 s, error 6 s (until dismissed with a Retry action). */
export const TOAST_DURATION_MS = {
  error: 6000,
  info: 5000,
  success: 3000,
  warning: 5000,
} as const;

type Listener = () => void;

let assertiveMessage = "";
const listeners = new Set<Listener>();

const emit = (): void => {
  for (const listener of listeners) {
    listener();
  }
};

/**
 * Errors are read out at once (`aria-live="assertive"`); Sonner's own region
 * is polite. Clearing first makes a repeated error announce again.
 */
function announceAssertive(message: string): void {
  assertiveMessage = "";
  emit();
  setTimeout(() => {
    assertiveMessage = message;
    emit();
  }, 50);
}

/** For the Toaster's hidden live region (`useSyncExternalStore`). */
export const assertiveAnnouncements = {
  getServerSnapshot: (): string => "",
  getSnapshot: (): string => assertiveMessage,
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

const withDuration = (
  duration: number,
  options?: ExternalToast
): ExternalToast => ({ duration, ...options });

/**
 * GhostMsg's toast API: Sonner's with the design's per-type durations and
 * assertive errors. Use it instead of `toast.success/info/warning/error`.
 * `toast.dismiss` and custom toasts (the Undo toast) still come from Sonner.
 */
export const notify = {
  error: (message: string, options?: ExternalToast): number | string => {
    announceAssertive(message);
    const duration = options?.action
      ? Number.POSITIVE_INFINITY
      : TOAST_DURATION_MS.error;
    return toast.error(message, withDuration(duration, options));
  },
  info: (message: string, options?: ExternalToast): number | string =>
    toast.info(message, withDuration(TOAST_DURATION_MS.info, options)),
  success: (message: string, options?: ExternalToast): number | string =>
    toast.success(message, withDuration(TOAST_DURATION_MS.success, options)),
  warning: (message: string, options?: ExternalToast): number | string =>
    toast.warning(message, withDuration(TOAST_DURATION_MS.warning, options)),
};
