import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/lib/utils";

export const DEFAULT_AMA_PROMPT =
  "Send me an anonymous message, confession, or question!";

const amaBannerVariants = cva(
  "relative flex flex-col gap-1.5 overflow-hidden rounded-[calc(var(--radius)+6px)]",
  {
    defaultVariants: { size: "md", tone: "brand" },
    variants: {
      size: { lg: "p-7", md: "p-5", sm: "px-4 py-3.5" },
      tone: {
        /** Accepting: the loud one. */
        brand: "bg-brand-gradient text-brand-foreground",
        /** Paused / not found. */
        quiet: "border border-input border-dashed bg-muted text-foreground",
        /** Dashboard preview, Q&A header. */
        soft: "bg-accent text-accent-foreground",
      },
    },
  }
);

const promptVariants = cva("text-balance font-display", {
  defaultVariants: { size: "md" },
  variants: {
    size: { lg: "text-h1", md: "text-h2", sm: "font-bold text-body" },
  },
});

export interface AmaBannerProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof amaBannerVariants> {
  /** Custom body (e.g. the paused note); replaces the prompt. */
  children?: React.ReactNode;
  /** Small uppercase line above the prompt, e.g. "AMA · maya". */
  eyebrow?: React.ReactNode;
  /** The recipient's AMA Prompt (falls back to the default prompt). */
  prompt?: string | null;
}

/** The recipient's AMA Prompt on the brand gradient (or soft / quiet tones). */
export function AmaBanner({
  prompt,
  eyebrow,
  tone,
  size,
  children,
  className,
  ...props
}: AmaBannerProps): React.JSX.Element {
  return (
    <section
      className={cn(amaBannerVariants({ size, tone }), className)}
      data-slot="ama-banner"
      {...props}
    >
      {eyebrow ? (
        <span className="font-bold text-xs uppercase tracking-[0.08em] opacity-90">
          {eyebrow}
        </span>
      ) : null}
      {children ?? (
        <p className={promptVariants({ size })}>
          {prompt || DEFAULT_AMA_PROMPT}
        </p>
      )}
    </section>
  );
}

export { amaBannerVariants };
