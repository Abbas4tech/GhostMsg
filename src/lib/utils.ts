import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge that knows the design's semantic type scale (`--text-*` in
 * globals.css). Each step sets size, line height, weight and tracking, so a
 * later `text-title` replaces an earlier `text-sm leading-snug font-medium`.
 * Without this, `text-h2` / `text-title` read as text colours and
 * `cn("text-h2", "text-destructive")` silently dropped the size.
 */
const twMerge = extendTailwindMerge<"text-scale">({
  extend: {
    classGroups: {
      "text-scale": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "title",
            "body-lg",
            "body",
            "overline",
          ],
        },
      ],
    },
    conflictingClassGroups: {
      "font-size": ["text-scale"],
      "text-scale": ["font-size", "font-weight", "leading", "tracking"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
