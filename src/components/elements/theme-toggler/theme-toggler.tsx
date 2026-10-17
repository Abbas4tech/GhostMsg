"use client";

import type { VariantProps } from "class-variance-authority";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type * as React from "react";
import { useCallback } from "react";
import { buttonVariants } from "@/components/elements/icon-button/icon-button";
import { cn } from "@/lib/utils";
import {
  type Resolved,
  type ThemeSelection,
  ThemeToggler as ThemeTogglerPrimitive,
  type ThemeTogglerProps as ThemeTogglerPrimitiveProps,
} from "./theme-toggler.primitive";
import { getNextTheme } from "./theme-toggler.utils";

const getIcon = (
  effective: ThemeSelection,
  resolved: Resolved,
  modes: ThemeSelection[]
) => {
  const theme = modes.includes("system") ? effective : resolved;
  if (theme === "system") {
    return <Monitor />;
  }
  if (theme === "dark") {
    return <Moon />;
  }
  return <Sun />;
};

type ThemeTogglerButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    modes?: ThemeSelection[];
    onImmediateChange?: ThemeTogglerPrimitiveProps["onImmediateChange"];
    direction?: ThemeTogglerPrimitiveProps["direction"];
  };

function ThemeTogglerButtonTrigger({
  effective,
  resolved,
  modes,
  toggleTheme,
  onClick,
  className,
  size,
  variant,
  ...props
}: Omit<
  ThemeTogglerButtonProps,
  "direction" | "modes" | "onImmediateChange"
> & {
  effective: ThemeSelection;
  modes: ThemeSelection[];
  resolved: Resolved;
  toggleTheme: (next: ThemeSelection) => void;
}) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      toggleTheme(getNextTheme(effective, modes));
    },
    [onClick, toggleTheme, effective, modes]
  );

  return (
    <button
      aria-label="Toggle theme"
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot="theme-toggler-button"
      onClick={handleClick}
      {...props}
    >
      {getIcon(effective, resolved, modes)}
    </button>
  );
}

function ThemeTogglerButton({
  variant = "default",
  size = "default",
  modes = ["light", "dark", "system"],
  direction = "ltr",
  onImmediateChange,
  onClick,
  className,
  ...props
}: ThemeTogglerButtonProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <ThemeTogglerPrimitive
      direction={direction}
      onImmediateChange={onImmediateChange}
      resolvedTheme={resolvedTheme as Resolved}
      setTheme={setTheme}
      theme={theme as ThemeSelection}
    >
      {({ effective, resolved, toggleTheme }) => (
        <ThemeTogglerButtonTrigger
          className={className}
          effective={effective}
          modes={modes}
          onClick={onClick}
          resolved={resolved}
          size={size}
          toggleTheme={toggleTheme}
          variant={variant}
          {...props}
        />
      )}
    </ThemeTogglerPrimitive>
  );
}

export { ThemeTogglerButton, type ThemeTogglerButtonProps };
