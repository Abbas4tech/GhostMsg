"use client";

import { useTheme } from "next-themes";
import type React from "react";
import type { JSX } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps): JSX.Element => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      className="toaster group"
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
