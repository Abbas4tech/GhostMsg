import { Copy, Link2, Sparkles } from "lucide-react";
import type React from "react";
import {
  SentimentBadge,
  type SentimentType,
} from "@/components/patterns/sentiment-badge";
import { cn } from "@/lib/utils";

export interface HowItWorksProps {
  /** Sample answer shown in step 3 and the story card. */
  answer: string;
  className?: string;
  /** Sample Anonymous Message shown in steps 2 and 4. */
  message: string;
  /** Public Profile Link label without protocol, e.g. "ghostmsg.app/u/maya". */
  profileLabel: string;
  sentiment: SentimentType;
}

const stepCard =
  "flex min-h-[178px] flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-soft motion-safe:animate-rise";
const stepTitle = "font-bold text-muted-foreground text-sm";

/**
 * The product loop in four beats (share → receive → answer → Story Card).
 * Illustrative only, so nothing inside is interactive.
 */
export function HowItWorks({
  profileLabel,
  message,
  answer,
  sentiment,
  className,
}: HowItWorksProps): React.JSX.Element {
  return (
    <ol
      aria-label="How GhostMsg works in four steps"
      className={cn("grid grid-cols-2 gap-3.5", className)}
      data-slot="how-it-works"
    >
      <li className={stepCard}>
        <span className={stepTitle}>1 · Share your link</span>
        <span className="flex min-h-11 items-center gap-2 rounded-full border border-input px-3.5 text-sm">
          <Link2 aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{profileLabel}</span>
        </span>
        <span
          aria-hidden="true"
          className="inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-primary px-3.5 font-semibold text-primary-foreground text-sm"
        >
          <Copy className="size-4" />
          Copy
        </span>
      </li>

      <li
        className={cn(stepCard, "mt-7 [animation-delay:80ms]")}
        data-step="receive"
      >
        <span className={stepTitle}>2 · Receive</span>
        <div className="relative flex flex-col gap-2 rounded-xl border bg-card p-3 before:absolute before:top-4 before:-left-px before:h-5 before:w-1 before:rounded-r before:bg-primary">
          <SentimentBadge className="self-start" sentiment={sentiment} />
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </li>

      <li className={cn(stepCard, "[animation-delay:160ms]")}>
        <span className={stepTitle}>3 · Answer</span>
        <p className="min-h-16 rounded-[14px] border border-input px-3 py-2.5 text-sm">
          {answer}
        </p>
        <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
          Smart Reply suggestions
        </span>
      </li>

      <li className="mt-7 flex min-h-[178px] flex-col justify-between rounded-xl bg-brand-gradient p-4 text-brand-foreground shadow-lift motion-safe:animate-rise motion-safe:[animation-delay:240ms]">
        <span className="font-bold text-xs uppercase tracking-wider">
          4 · Share as Story Card
        </span>
        <p className="font-bold font-display text-lg leading-tight">
          &ldquo;{message}&rdquo;
        </p>
        <span className="font-semibold text-xs">{profileLabel}</span>
      </li>
    </ol>
  );
}
