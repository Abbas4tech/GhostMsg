import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

// `default` variant + `md` size reproduce the original shadcn input exactly.
const inputVariants = cva(
  [
    "flex w-full min-w-0 rounded-md border py-1 shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  ],
  {
    variants: {
      variant: {
        default: "border-input bg-transparent dark:bg-input/30",
        filled: "border-accent bg-accent/40 focus-visible:bg-transparent",
        glass:
          "border-white/20 bg-white/10 backdrop-blur-md dark:border-white/10 dark:bg-black/20",
      },
      sizeVariant: {
        sm: "h-8 px-2.5 text-xs",
        md: "h-9 px-3 text-base md:text-sm",
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
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

// React 19: `ref` is a regular prop, so no forwardRef is needed.
function Input({
  className,
  type,
  variant,
  sizeVariant,
  ...props
}: InputProps): React.JSX.Element {
  return (
    <input
      className={cn(inputVariants({ variant, sizeVariant }), className)}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input, inputVariants };
export default Input;
