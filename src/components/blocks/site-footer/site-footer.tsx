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

/** Quiet site footer: tagline and a couple of links. */
export function SiteFooter({ className }: SiteFooterProps): React.JSX.Element {
  return (
    <footer
      className={cn(
        "mx-auto flex w-full max-w-[1180px] flex-wrap justify-between gap-x-6 gap-y-3 px-4 pt-7 pb-8 text-muted-foreground text-sm sm:px-6",
        className
      )}
      data-slot="site-footer"
    >
      <span>GhostMsg · honesty without exposure</span>
      <nav aria-label="Footer" className="flex gap-5">
        {FOOTER_LINKS.map(({ href, label }) => (
          <Link
            className="underline-offset-4 hover:text-foreground hover:underline"
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
