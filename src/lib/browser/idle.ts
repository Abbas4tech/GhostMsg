const IDLE_TIMEOUT_MS = 2000;
const FALLBACK_DELAY_MS = 200;

/**
 * Runs `callback` when the browser is idle (or after a short delay where
 * `requestIdleCallback` is missing, e.g. Safari). Returns a cancel function.
 * Used to prefetch lazy chunks without competing with first paint.
 */
export function runWhenIdle(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, {
      timeout: IDLE_TIMEOUT_MS,
    });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, FALLBACK_DELAY_MS);
  return () => window.clearTimeout(id);
}
