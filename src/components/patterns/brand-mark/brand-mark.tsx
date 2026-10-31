import { cva, type VariantProps } from "class-variance-authority";
import { Ghost } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { cn } from "@/lib/utils";

const brandMarkTileVariants = cva(
  "grid shrink-0 place-items-center bg-brand-gradient text-brand-foreground",
  {
    defaultVariants: { size: "md" },
    variants: {
      size: {
        /** Phone dashboard top bar: 32px tile. */
        header: "size-8 rounded-[10px] [&_svg]:size-[18px]",
        md: "size-9 rounded-xl [&_svg]:size-5",
        sm: "size-7 rounded-[9px] [&_svg]:size-4",
      },
    },
  }
);

const wordmarkVariants = cva("font-bold font-display tracking-tight", {
  defaultVariants: { size: "md" },
  variants: {
    size: { header: "text-base", md: "text-[22px]", sm: "text-base" },
  },
});

export interface BrandMarkProps
  extends VariantProps<typeof brandMarkTileVariants> {
  className?: string;
  /** Wraps the mark in a link (e.g. "/" in headers). */
  href?: string;
  /** Hide the "GhostMsg" wordmark and keep only the tile. */
  iconOnly?: boolean;
}

/** GhostMsg logo: gradient ghost tile plus wordmark. */
export function BrandMark({
  size,
  href,
  iconOnly = false,
  className,
}: BrandMarkProps): React.JSX.Element {
  const content = (
    <>
      <span aria-hidden="true" className={brandMarkTileVariants({ size })}>
        <Ghost />
      </span>
      {iconOnly ? (
        <span className="sr-only">GhostMsg</span>
      ) : (
        <span className={wordmarkVariants({ size })}>GhostMsg</span>
      )}
    </>
  );
  const classes = cn("inline-flex items-center gap-2.5", className);

  if (href) {
    return (
      <Link className={classes} data-slot="brand-mark" href={href}>
        {content}
      </Link>
    );
  }
  return (
    <span className={classes} data-slot="brand-mark">
      {content}
    </span>
  );
}
