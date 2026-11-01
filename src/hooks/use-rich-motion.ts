import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** At or below this many logical cores, decorative motion is skipped. */
const LOW_END_CORES = 4;

interface NetworkInformationLike {
  saveData?: boolean;
}

const isCapableDevice = (): boolean => {
  const { connection } = navigator as Navigator & {
    connection?: NetworkInformationLike;
  };
  if (connection?.saveData) {
    return false;
  }
  const cores = navigator.hardwareConcurrency ?? LOW_END_CORES + 1;
  return cores > LOW_END_CORES;
};

/**
 * True when decorative "rich motion" (parallax, scroll-linked depth, bursts)
 * should run: motion allowed by the OS, no Save-Data, not a low-end device
 * (ADR 0035, R4). Starts false and resolves after mount, so server and first
 * client render match and nothing decorative blocks hydration.
 */
export function useRichMotion(): boolean {
  const prefersReduced = useReducedMotion();
  const [isCapable, setIsCapable] = useState(false);

  useEffect(() => {
    setIsCapable(isCapableDevice());
  }, []);

  return isCapable && !prefersReduced;
}
