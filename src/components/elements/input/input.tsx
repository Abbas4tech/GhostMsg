"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-transparent text-base shadow-xs outline-none transition-[color,box-shadow] file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "border-input bg-transparent",
        filled: "border-accent bg-accent/40 focus-visible:bg-transparent",
        glass:
          "border-white/20 bg-white/10 backdrop-blur-md dark:border-white/10 dark:bg-black/20",
      },
      sizeVariant: {
        sm: "h-8 px-2.5 text-xs",
        md: "h-9 px-3 text-sm",
        lg: "h-11 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      sizeVariant: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, sizeVariant, ...props }, ref) => {
    return (
      <input
        className={cn(inputVariants({ variant, sizeVariant, className }))}
        ref={ref}
        type={type}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
export default Input;
