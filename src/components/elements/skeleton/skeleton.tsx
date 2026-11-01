import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";

import { cn } from "@/lib/utils";

/**
 * Stock shadcn Skeleton. GhostMsg adds the opt-in `shimmer` variant: a light
 * sweep on a pseudo-element (transform only, compositor-friendly) that holds
 * still under reduced motion.
 */
const skeletonVariants = cva("rounded-md bg-accent", {
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      default: "animate-pulse",
      shimmer:
        "relative isolate overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-transparent before:via-background/60 before:to-transparent motion-safe:before:animate-shimmer",
    },
  },
});

export type SkeletonProps = React.ComponentProps<"div"> &
  VariantProps<typeof skeletonVariants>;

function Skeleton({
  className,
  variant,
  ...props
}: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      data-slot="skeleton"
      data-variant={variant ?? "default"}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
