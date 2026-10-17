import type { ThemeTogglerButtonProps } from "./theme-toggler";

export const defaultThemeTogglerArgs: ThemeTogglerButtonProps = {
  direction: "ltr",
  modes: ["dark", "light"],
  size: "default",
  variant: "default",
};

export const withSystemThemeTogglerArgs = {
  modes: ["light", "dark", "system"],
} satisfies Partial<ThemeTogglerButtonProps>;
