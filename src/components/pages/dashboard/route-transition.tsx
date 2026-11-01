import type React from "react";
import type { PropsWithChildren } from "react";

/**
 * Soft enter for a dashboard route (Inbox, Profile, Settings). Rendered from
 * `app/(dashboard)/dashboard/template.tsx`, which remounts per navigation, so
 * the CSS rise replays without any JS (ADR 0035, M5). The shell and sidebar
 * sit above it in the layout and never re-animate.
 */
export function RouteTransition({
  children,
}: PropsWithChildren): React.JSX.Element {
  return (
    <div className="motion-safe:animate-rise" data-slot="route-transition">
      {children}
    </div>
  );
}
