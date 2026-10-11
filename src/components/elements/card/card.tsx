import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "flex flex-col gap-4 rounded-xl text-card-foreground md:gap-6",
  {
    variants: {
      variant: {
        default: "border bg-card py-4 shadow-sm md:py-6",
        glass:
          "border border-white/20 bg-white/10 py-4 shadow-sm backdrop-blur-md md:py-6 dark:border-white/10 dark:bg-black/20",
        ghost: "border-none bg-transparent py-2 shadow-none",
        bordered: "border-2 border-border bg-card py-4 shadow-sm md:py-6",
      },
      size: {
        default: "",
        sm: "gap-2 py-3 text-xs md:gap-3 md:py-4",
        lg: "gap-6 py-6 text-base md:gap-8 md:py-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({
  className,
  variant,
  size,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <div
      className={cn(cardVariants({ variant, size }), className)}
      data-slot="card"
      {...props}
    />
  );
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] md:px-6 [.border-b]:pb-6",
        className
      )}
      data-slot="card-header"
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      className={cn("font-semibold leading-none", className)}
      data-slot="card-title"
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="card-description"
      {...props}
    />
  );
}

function CardAction({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      data-slot="card-action"
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      className={cn("px-4 md:px-6", className)}
      data-slot="card-content"
      {...props}
    />
  );
}

function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      data-slot="card-footer"
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
};
