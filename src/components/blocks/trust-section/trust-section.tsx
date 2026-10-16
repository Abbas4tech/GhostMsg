import { EyeOff, Ghost, Pause } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

const TRUST_POINTS = [
  {
    body: "Nobody signs in to send an Anonymous Message. Blocking uses a Sender Hash, so a Recipient can stop one sender without ever learning who it is.",
    icon: Ghost,
    title: "Senders stay anonymous",
  },
  {
    body: "Toxic and spam messages are auto-flagged into Quarantined Messages. They are blurred, and you decide whether to ever look.",
    icon: EyeOff,
    title: "Ugly stuff stays out of sight",
  },
  {
    body: "Turn Message Acceptance off any time. Your link stays up and shows a calm “messages paused” note.",
    icon: Pause,
    title: "You hold the switch",
  },
] as const;

export interface TrustSectionProps {
  className?: string;
  /** Anchor id for the header's "Safety" link. */
  id?: string;
}

/** Landing trust row: anonymity, quarantine and Message Acceptance. */
export function TrustSection({
  id = "safety",
  className,
}: TrustSectionProps): React.JSX.Element {
  return (
    <section
      aria-label="Safety"
      className={cn(
        "mx-auto w-full max-w-[1180px] scroll-mt-6 px-gutter pt-6 pb-16",
        className
      )}
      data-slot="trust-section"
      id={id}
    >
      <h2 className="mb-5 text-h2">Safe by default</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-7 rounded-xl border bg-card p-6 text-card-foreground shadow-soft sm:p-8">
        {TRUST_POINTS.map(({ icon: Icon, title, body }) => (
          <div className="flex flex-col gap-2" key={title}>
            <span className="grid size-11 place-items-center rounded-[14px] bg-accent text-accent-foreground">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <h3 className="text-h3">{title}</h3>
            <p className="text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustSection;
