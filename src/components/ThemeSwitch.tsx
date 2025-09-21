"use client";

import * as React from "react";
import { SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ThemeSwitch = ({
  className,
  ...rest
}: React.ComponentProps<typeof Button>): React.JSX.Element => {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      {...rest}
      className={cn("", className)}
    >
      <SunMoon className="h-[1.5rem] w-[1.5rem] transition-all" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeSwitch;
