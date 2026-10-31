import Link from "next/link";
import type React from "react";
import { cn } from "@/lib/utils";

const FOOTER_LINKS = [
  { href: "/#safety", label: "Safety" },
  { href: "/docs", label: "API docs" },
] as const;

export interface SiteFooterProps {
  className?: string;
}

/**
 * Quiet site footer: tagline and links (design Landing: underlined,
 * right-aligned). Phones (design MobLanding): stacked, with 44px link targets.
 */
export function SiteFooter({ className }: SiteFooterProps): React.JSX.Element {
  return (
    <footer
      className={cn(
        "mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-gutter pt-7 pb-8 text-muted-foreground text-sm sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-6",
        className
      )}
      data-slot="site-footer"
    >
      <span>GhostMsg · honesty without exposure</span>
      <nav aria-label="Footer" className="-ml-3 flex gap-1 sm:ml-0 sm:gap-5">
        {FOOTER_LINKS.map(({ href, label }) => (
          <Link
            className="underline underline-offset-4 hover:text-foreground max-sm:inline-flex max-sm:h-11 max-sm:items-center max-sm:rounded-full max-sm:px-3 max-sm:font-semibold max-sm:no-underline max-sm:hover:bg-accent"
            href={href}
            key={href}
          >
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
