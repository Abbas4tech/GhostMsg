"use client";

import { cva, type VariantProps } from "class-variance-authority";

import {
  LiquidButton as LiquidButtonPrimitive,
  type LiquidButtonProps as LiquidButtonPrimitiveProps,
} from "@/components/animate-ui/primitives/buttons/liquid";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-[box-shadow,_color,_background-color,_border-color,_outline-color,_text-decoration-color,_fill,_stroke] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "text-primary shadow-xs [--liquid-button-background-color:var(--accent)] [--liquid-button-color:var(--primary)] hover:text-primary-foreground",
        destructive:
          "text-white shadow-xs [--liquid-button-background-color:var(--accent)] [--liquid-button-color:var(--destructive)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        secondary:
          "text-secondary shadow-xs [--liquid-button-background-color:var(--accent)] [--liquid-button-color:var(--secondary)] hover:text-secondary-foreground",
        ghost:
          "text-primary shadow-xs [--liquid-button-background-color:var(--transparent)] [--liquid-button-color:var(--primary)] hover:text-primary-foreground",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type LiquidButtonProps = LiquidButtonPrimitiveProps &
  VariantProps<typeof buttonVariants>;

function LiquidButton({
  className,
  variant,
  size,
  ...props
}: LiquidButtonProps) {
  return (
    <LiquidButtonPrimitive
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { LiquidButton, buttonVariants, type LiquidButtonProps };
