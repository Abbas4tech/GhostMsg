import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/elements/button";
import { cn } from "@/lib/utils";

export interface CtaBannerProps {
  actionHref: string;
  actionLabel: string;
  className?: string;
  /**
   * Second sentence. Desktop: part of the heading. Phones (design
   * MobLanding): its own line under a shorter heading.
   */
  subtitle?: React.ReactNode;
  title: React.ReactNode;
}

/** Closing call to action on the brand gradient. */
export function CtaBanner({
  title,
  subtitle,
  actionHref,
  actionLabel,
  className,
}: CtaBannerProps): React.JSX.Element {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-[1180px] px-gutter pt-10 sm:pt-0 sm:pb-10",
        className
      )}
      data-slot="cta-banner"
    >
      <div className="flex flex-col gap-4.5 rounded-[28px] bg-brand-gradient px-5 py-7 text-brand-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6 sm:rounded-[32px] sm:px-8 sm:py-12">
        <div className="flex max-w-[620px] flex-col gap-4.5">
          <h2 className="text-balance text-h1 sm:text-h2 md:text-h1">
            {title}
            {subtitle ? (
              <span className="max-sm:hidden"> {subtitle}</span>
            ) : null}
          </h2>
          {subtitle ? (
            <p className="text-body opacity-95 sm:hidden">{subtitle}</p>
          ) : null}
        </div>
        <Button
          asChild
          className="rounded-full bg-card text-primary hover:bg-card/90 max-sm:h-13 max-sm:w-full"
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
