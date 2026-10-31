"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RESEND_COOLDOWN_SECONDS } from "@/lib/users/verification";

const TICK_MS = 1000;

/**
 * Seconds until "Resend code" unlocks. Starts at the full cooldown on mount
 * (sign-up has just sent a code); `restart(seconds)` after each resend or a
 * refused one (the server's `retryAfterSeconds`). Ticks once a second.
 */
export function useResendCooldownController() {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const endsAtRef = useRef<number | null>(null);

  const restart = useCallback((seconds: number) => {
    endsAtRef.current = Date.now() + seconds * TICK_MS;
    setSecondsLeft(seconds);
  }, []);

  useEffect(() => {
    restart(RESEND_COOLDOWN_SECONDS);
  }, [restart]);

  const isCooling = secondsLeft > 0;
  useEffect(() => {
    if (!isCooling) {
      return;
    }
    const timer = setInterval(() => {
      const endsAt = endsAtRef.current ?? Date.now();
      setSecondsLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / TICK_MS)));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [isCooling]);

  return { restart, secondsLeft };
}
