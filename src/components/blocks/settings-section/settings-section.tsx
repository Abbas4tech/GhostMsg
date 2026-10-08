"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/lib/utils";

const settingsSectionVariants = cva(
  "flex flex-col justify-between gap-4 rounded-xl p-4 transition-all sm:flex-row sm:items-center",
  {
    variants: {
      variant: {
        card: "border border-border/50 bg-card shadow-xs hover:border-border",
        grouped:
          "rounded-none border-border/40 border-b bg-muted/30 p-3.5 last:border-none",
        minimal: "bg-transparent p-2",
      },
      size: {
        sm: "gap-2 p-3 text-xs",
        md: "gap-4 p-4 text-sm",
        lg: "gap-6 p-6 text-base",
      },
    },
    defaultVariants: {
      variant: "card",
      size: "md",
    },
  }
);

export interface SettingsSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof settingsSectionVariants> {
  actionButtonSlot?: React.ReactNode;
  controlSlot?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  title: React.ReactNode;
}

export function SettingsSection({
  className,
  variant,
  size,
  title,
  description,
  icon,
  controlSlot,
  actionButtonSlot,
  ...props
}: SettingsSectionProps): React.JSX.Element {
  return (
    <div
      className={cn(settingsSectionVariants({ variant, size, className }))}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon && (
          <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
        )}
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="truncate font-semibold text-foreground">{title}</div>
          {description && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
        {controlSlot}
        {actionButtonSlot}
      </div>
    </div>
  );
}

export { settingsSectionVariants };
export default SettingsSection;
