import type { ThemeTogglerButtonProps } from "./theme-toggler";

export const defaultThemeTogglerArgs: ThemeTogglerButtonProps = {
  modes: ["dark", "light"],
  variant: "default",
  size: "default",
  direction: "ltr",
};

export const withSystemThemeTogglerArgs = {
  modes: ["light", "dark", "system"],
} satisfies Partial<ThemeTogglerButtonProps>;
