import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Stock shadcn (new-york v4) Badge. GhostMsg opt-in variants: `glass`,
 * `success` / `warning` / `neutral` soft status pills and `count` /
 * `attention` counters (they invert inside an `on` toggle).
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-transparent px-2 py-0.5 font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        attention:
          "h-[22px] min-w-[22px] bg-warning in-data-[state=on]:bg-primary-foreground/20 px-1.5 in-data-[state=on]:text-primary-foreground text-warning-foreground tabular-nums",
        count:
          "h-[22px] min-w-[22px] bg-muted in-data-[state=on]:bg-primary-foreground/20 px-1.5 in-data-[state=on]:text-primary-foreground text-muted-foreground tabular-nums",
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        glass:
          "border-white/20 bg-white/10 text-foreground backdrop-blur-md dark:border-white/10 dark:bg-black/20",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        neutral:
          "h-7 border-sentiment-neutral/30 bg-sentiment-neutral-subtle px-2.5 font-semibold text-[13px] text-sentiment-neutral",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        success:
          "h-6 border-success/30 bg-success/15 px-2.5 font-semibold text-success",
        warning:
          "h-6 border-warning/40 bg-warning/20 px-2.5 font-semibold text-warning-foreground",
      },
    },
  }
);

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: BadgeProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      data-variant={variant}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
