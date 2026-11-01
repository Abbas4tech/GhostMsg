import { useState } from "react";

/**
 * True from the first time `open` becomes true, and stays true afterwards.
 * Gates lazy overlays: nothing is mounted (or downloaded) until the first
 * open, then the overlay stays mounted so its exit animation can finish.
 */
export function useHasOpened(open: boolean): boolean {
  const [hasOpened, setHasOpened] = useState(open);
  if (open && !hasOpened) {
    setHasOpened(true);
  }
  return hasOpened;
}
