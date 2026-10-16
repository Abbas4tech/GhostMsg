"use client";

import { Root, Thumb } from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

// `default` variant + `md` size reproduce the original shadcn switch exactly.
const switchVariants = cva(
  "peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        success:
          "data-[state=checked]:bg-success data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
      },
      size: {
        sm: "h-4 w-7",
        md: "h-[1.15rem] w-8",
        lg: "h-6 w-11",
        /** 48×28 touch-friendly switch used in settings rows. */
        xl: "h-7 w-12 p-[3px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-background ring-0 transition-transform data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground",
  {
    variants: {
      size: {
        sm: "size-3.5 data-[state=checked]:translate-x-3",
        md: "size-4 data-[state=checked]:translate-x-[calc(100%-2px)]",
        lg: "size-5 data-[state=checked]:translate-x-5",
        xl: "size-[22px] data-[state=checked]:translate-x-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface SwitchProps
  extends React.ComponentProps<typeof Root>,
    VariantProps<typeof switchVariants> {}

export function Switch({
  className,
  variant,
  size,
  ...props
}: SwitchProps): React.JSX.Element {
  return (
    <Root
      className={cn(switchVariants({ variant, size }), className)}
      data-slot="switch"
      {...props}
    >
      <Thumb className={thumbVariants({ size })} data-slot="switch-thumb" />
    </Root>
  );
}

export { switchVariants };
