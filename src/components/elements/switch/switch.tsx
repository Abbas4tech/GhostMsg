"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

// `default` variant + `md` size reproduce the original shadcn switch exactly.
const switchVariants = cva(
  "peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
  {
    defaultVariants: {
      size: "md",
      variant: "default",
    },
    variants: {
      size: {
        lg: "h-6 w-11",
        md: "h-[1.15rem] w-8",
        sm: "h-4 w-7",
        /** 48×28 touch-friendly switch used in settings rows. */
        xl: "h-7 w-12 p-[3px]",
      },
      variant: {
        default:
          "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        success:
          "data-[state=checked]:bg-success data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
      },
    },
  }
);

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-background ring-0 transition-transform data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground",
  {
    defaultVariants: {
      size: "md",
    },
    variants: {
      size: {
        lg: "size-5 data-[state=checked]:translate-x-5",
        md: "size-4 data-[state=checked]:translate-x-[calc(100%-2px)]",
        sm: "size-3.5 data-[state=checked]:translate-x-3",
        xl: "size-[22px] data-[state=checked]:translate-x-5",
      },
    },
  }
);

export interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  required?: boolean;
}

export function Switch({
  className,
  variant,
  size,
  ...props
}: SwitchProps): React.JSX.Element {
  return (
    <SwitchPrimitive.Root
      className={cn(switchVariants({ size, variant }), className)}
      data-slot="switch"
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={thumbVariants({ size })}
        data-slot="switch-thumb"
      />
    </SwitchPrimitive.Root>
  );
}

export { switchVariants };
