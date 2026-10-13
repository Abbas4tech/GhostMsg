import { cva, type VariantProps } from "class-variance-authority";
import { type ElementType, forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const textVariants = cva("text-xl", {
  variants: {
    variant: {
      h1: "scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl",
      h2: "scroll-m-20 font-semibold text-3xl tracking-tight first:mt-0",
      "h2-underline":
        "scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0", // With underline
      h3: "scroll-m-20 font-semibold text-2xl tracking-tight",
      h4: "scroll-m-20 font-semibold text-xl tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      "inline-code":
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm",
      lead: "text-muted-foreground text-xl",
      large: "font-semibold text-lg",
      small: "font-medium text-sm leading-none",
      muted: "text-muted-foreground text-sm",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

export interface TextProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: ElementType;
}

const Text = forwardRef<HTMLElement, TextProps>(
  ({ className, variant = "p", as: Component = "p", ...props }, ref) => {
    return (
      <Component
        className={cn(textVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Text.displayName = "Text";

export { Text, textVariants };
