import type { ThemeSelection } from "./theme-toggler.primitive";

/** Next theme in the configured cycle; unknown current themes restart the cycle. */
export function getNextTheme(
  effective: ThemeSelection,
  modes: ThemeSelection[]
): ThemeSelection {
  const index = modes.indexOf(effective);
  if (index === -1) {
    return modes[0];
  }
  return modes[(index + 1) % modes.length];
}
