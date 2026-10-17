import type React from "react";
import { cn } from "@/lib/utils";

export interface SectionNavItem {
  id: string;
  label: string;
}

export interface SectionNavProps {
  activeId?: string;
  className?: string;
  items: SectionNavItem[];
}

/** "On this page" anchor list; the active section gets aria-current. */
export function SectionNav({
  items,
  activeId,
  className,
}: SectionNavProps): React.JSX.Element {
  return (
    <nav
      aria-label="On this page"
      className={cn("flex flex-col gap-0.5", className)}
      data-slot="section-nav"
    >
      {items.map(({ id, label }) => {
        const isActive = id === activeId;
        return (
          <a
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "flex min-h-10 items-center rounded-[10px] px-3 font-semibold text-muted-foreground text-sm outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isActive && "bg-accent text-accent-foreground"
            )}
            href={`#${id}`}
            key={id}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
