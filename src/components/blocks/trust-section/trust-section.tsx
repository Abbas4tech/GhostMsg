import { EyeOff, Ghost, Pause } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

/** `short` is the phone copy (design MobLanding), `body` the desktop copy. */
const TRUST_POINTS = [
  {
    body: "Nobody signs in to send an Anonymous Message. Blocking uses a Sender Hash, so a Recipient can stop one sender without ever learning who it is.",
    icon: Ghost,
    short:
      "Nobody signs in to send. Blocking uses a Sender Hash, so you can stop someone without learning who they are.",
    title: "Senders stay anonymous",
  },
  {
    body: "Toxic and spam messages are auto-flagged into Quarantined Messages. They are blurred, and you decide whether to ever look.",
    icon: EyeOff,
    short:
      "Toxic and spam messages become Quarantined Messages, blurred until you choose to look.",
    title: "Ugly stuff stays out of sight",
  },
  {
    body: "Turn Message Acceptance off any time. Your link stays up and shows a calm “messages paused” note.",
    icon: Pause,
    short:
      "Turn Message Acceptance off any time. Your link shows a calm “paused” note.",
    title: "You hold the switch",
  },
] as const;

export interface TrustSectionProps {
  className?: string;
  /** Anchor id for the header's "Safety" link. */
  id?: string;
}

/**
 * Landing trust row: anonymity, quarantine and Message Acceptance. Desktop:
 * three columns in one card (the heading is for screen readers only, as on
 * the design). Phones (design MobLanding): "Safe by default" over a list of
 * icon rows.
 */
export function TrustSection({
  id = "safety",
  className,
}: TrustSectionProps): React.JSX.Element {
  return (
    <section
      aria-label="Safety"
      className={cn(
        "mx-auto w-full max-w-[1180px] scroll-mt-6 px-gutter pt-10 pb-0 sm:pt-6 sm:pb-16",
        className
      )}
      data-slot="trust-section"
      id={id}
    >
      <h2 className="mb-3.5 text-h2 sm:sr-only">Safe by default</h2>
      <ul className="overflow-hidden rounded-xl border bg-card text-card-foreground max-sm:divide-y sm:grid sm:grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] sm:gap-7 sm:p-8 sm:shadow-soft">
        {TRUST_POINTS.map(({ icon: Icon, title, body, short }) => (
          <li
            className="flex items-start gap-3 p-4 sm:flex-col sm:gap-2 sm:p-0"
            key={title}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-accent text-accent-foreground sm:size-11 sm:rounded-[14px]">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-px sm:gap-2">
              <h3 className="text-title sm:text-h3">{title}</h3>
              <p className="text-muted-foreground text-sm sm:hidden">{short}</p>
              <p className="text-muted-foreground max-sm:hidden">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
