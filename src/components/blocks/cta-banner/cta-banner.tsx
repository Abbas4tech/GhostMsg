import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/elements/button";
import { cn } from "@/lib/utils";

export interface CtaBannerProps {
  actionHref: string;
  actionLabel: string;
  className?: string;
  title: React.ReactNode;
}

/** Closing call to action on the brand gradient. */
export function CtaBanner({
  title,
  actionHref,
  actionLabel,
  className,
}: CtaBannerProps): React.JSX.Element {
  return (
    <section
      className={cn("mx-auto w-full max-w-[1180px] px-gutter pb-10", className)}
      data-slot="cta-banner"
    >
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-[32px] bg-brand-gradient px-6 py-12 text-brand-foreground sm:px-8">
        <h2 className="max-w-[620px] text-balance text-h2">{title}</h2>
        <Button
          asChild
          className="rounded-full bg-card text-primary hover:bg-card/90"
          size="xl"
        >
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
