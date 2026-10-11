import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/lib/utils";

const settingsSectionVariants = cva("flex justify-between transition-all", {
  variants: {
    variant: {
      card: "flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 shadow-xs hover:border-border sm:flex-row sm:items-center",
      grouped:
        "flex-col gap-4 border-border/40 border-b bg-muted/30 p-3.5 last:border-none sm:flex-row sm:items-center",
      minimal: "flex-col gap-4 bg-transparent p-2 sm:flex-row sm:items-center",
      /** Bordered inline row used inside a settings Card (label + hint + control). */
      row: "items-center gap-4 rounded-lg border p-4",
    },
    size: {
      sm: "gap-2 p-3 text-xs",
      md: "",
      lg: "gap-6 p-6 text-base",
    },
  },
  defaultVariants: {
    variant: "card",
    size: "md",
  },
});

const titleVariants = cva("text-foreground", {
  variants: {
    variant: {
      card: "truncate font-semibold",
      grouped: "truncate font-semibold",
      minimal: "truncate font-semibold",
      row: "font-medium text-base",
    },
  },
  defaultVariants: { variant: "card" },
});

const descriptionVariants = cva("text-muted-foreground", {
  variants: {
    variant: {
      card: "text-xs leading-relaxed",
      grouped: "text-xs leading-relaxed",
      minimal: "text-xs leading-relaxed",
      row: "text-sm",
    },
  },
  defaultVariants: { variant: "card" },
});

export interface SettingsSectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof settingsSectionVariants> {
  actionButtonSlot?: React.ReactNode;
  controlId?: string;
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
  controlId,
  controlSlot,
  actionButtonSlot,
  ...props
}: SettingsSectionProps): React.JSX.Element {
  const titleClassName = titleVariants({ variant });

  return (
    <div
      className={cn(settingsSectionVariants({ variant, size }), className)}
      data-slot="settings-section"
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon && (
          <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
        )}
        <div className="flex min-w-0 flex-col gap-0.5">
          {controlId ? (
            <label
              className={cn("cursor-pointer", titleClassName)}
              htmlFor={controlId}
            >
              {title}
            </label>
          ) : (
            <div className={titleClassName}>{title}</div>
          )}
          {description && (
            <p className={descriptionVariants({ variant })}>{description}</p>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-3",
          variant !== "row" && "self-end sm:self-center"
        )}
      >
        {controlSlot}
        {actionButtonSlot}
      </div>
    </div>
  );
}

export { settingsSectionVariants };
export default SettingsSection;
