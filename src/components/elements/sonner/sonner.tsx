"use client";

import { useTheme } from "next-themes";
import type React from "react";
import type { JSX } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Bottom nav is min-h-16 (64px) + its own safe-area padding; clear it with a 16px gap. */
const MOBILE_BOTTOM_OFFSET = "calc(4rem + env(safe-area-inset-bottom) + 16px)";

const Toaster = ({ ...props }: ToasterProps): JSX.Element => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      className="toaster group"
      mobileOffset={{ bottom: MOBILE_BOTTOM_OFFSET }}
      richColors
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      theme={theme as ToasterProps["theme"]}
      {...props}
    />
  );
};

export { Toaster };
