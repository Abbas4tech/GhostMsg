"use client";

import { Copy, Link2, Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/elements/carousel";
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

type StepLayout = "desktop" | "phone";

interface Step {
  /** Card body under the step title. */
  body: React.ReactNode;
  /** The brand-gradient Story Card step (its own title style). */
  isStoryCard?: boolean;
  key: string;
  /** "Share your link" (shown as "1 · …" or "Step 1 · …"). */
  name: string;
}

const STEP_TITLE_CLASS: Record<StepLayout, string> = {
  desktop: "font-bold text-muted-foreground text-sm",
  phone: "text-muted-foreground text-overline uppercase",
};

function buildSteps(
  { answer, message, profileLabel, sentiment }: HowItWorksProps,
  layout: StepLayout
): Step[] {
  return [
    {
      body: (
        <>
          <span className="flex min-h-11 items-center gap-2 rounded-full border border-input px-3.5 text-sm max-sm:min-h-12 max-sm:font-semibold">
            <Link2
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <span className="min-w-0 flex-1 truncate">{profileLabel}</span>
          </span>
          <span
            aria-hidden="true"
            className="inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-primary px-3.5 font-semibold text-primary-foreground text-sm"
          >
            <Copy className="size-4" />
            Copy
          </span>
          {layout === "phone" ? (
            <p className="text-muted-foreground text-sm">
              Paste it in your Instagram or Snapchat bio.
            </p>
          ) : null}
        </>
      ),
      key: "share",
      name: "Share your link",
    },
    {
      body: (
        <div className="relative flex flex-col gap-2 rounded-xl border bg-card p-3 before:absolute before:top-4 before:-left-px before:h-5 before:w-1 before:rounded-r before:bg-primary">
          <SentimentBadge className="self-start" sentiment={sentiment} />
          <p
            className={cn(
              "leading-relaxed",
              layout === "phone" ? "text-body" : "text-sm"
            )}
          >
            {message}
          </p>
        </div>
      ),
      key: "receive",
      name: "Receive",
    },
    {
      body: (
        <>
          <p className="min-h-16 rounded-[14px] border border-input px-3 py-2.5 text-sm">
            {answer}
          </p>
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
            Smart Reply suggestions
          </span>
        </>
      ),
      key: "answer",
      name: "Answer",
    },
    {
      body: (
        <>
          <p className="font-display text-lg leading-tight">
            &ldquo;{message}&rdquo;
          </p>
          <span className="font-semibold text-xs">{profileLabel}</span>
        </>
      ),
      isStoryCard: true,
      key: "story-card",
      name: "Share as Story Card",
    },
  ];
}

function StepCard({
  step,
  index,
  layout,
}: {
  index: number;
  layout: StepLayout;
  step: Step;
}): React.JSX.Element {
  const number = index + 1;
  const title =
    layout === "phone"
      ? `Step ${number} · ${step.name}`
      : `${number} · ${step.name}`;

  if (step.isStoryCard) {
    return (
      <div className="flex min-h-44.5 flex-col justify-between gap-3 rounded-xl bg-brand-gradient p-4 text-brand-foreground shadow-lift">
        <span className="font-bold text-xs uppercase tracking-wider">
          {title}
        </span>
        {step.body}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border bg-card text-card-foreground shadow-soft",
        layout === "phone" ? "gap-3.5 p-4.5" : "min-h-44.5 gap-3 p-4"
      )}
    >
      <span className={STEP_TITLE_CLASS[layout]}>{title}</span>
      {step.body}
    </div>
  );
}

/**
 * The product loop in four beats (share → receive → answer → Story Card).
 * Illustrative only, so nothing inside is interactive. Desktop: a staggered
 * 2×2 grid. Phones (design MobLanding): "How it works", a counter, one card
 * plus a peek, and pill dots.
 */
export function HowItWorks(props: HowItWorksProps): React.JSX.Element {
  const desktopSteps = buildSteps(props, "desktop");

  return (
    <div className={props.className} data-slot="how-it-works">
      <ol
        aria-label="How GhostMsg works in four steps"
        className="hidden grid-cols-2 gap-3.5 sm:grid"
      >
        {desktopSteps.map((step, index) => (
          <li
            className={cn("motion-safe:animate-rise")}
            data-slot="how-it-works-step"
            key={step.key}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <StepCard index={index} layout="desktop" step={step} />
          </li>
        ))}
      </ol>
      <HowItWorksMobile steps={buildSteps(props, "phone")} />
    </div>
  );
}

function HowItWorksMobile({ steps }: { steps: Step[] }): React.JSX.Element {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <section
      aria-label="How it works"
      aria-roledescription="carousel"
      className="flex flex-col gap-3.5 sm:hidden"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-h2">How it works</h2>
        <span className="text-muted-foreground text-xs tabular-nums">
          {selected + 1} / {steps.length}
        </span>
      </div>
      <Carousel opts={{ align: "start" }} setApi={setApi}>
        <CarouselContent className="-ml-3">
          {steps.map((step, index) => (
            <CarouselItem
              aria-label={`Step ${index + 1} of ${steps.length}`}
              className="basis-68 pl-3"
              key={step.key}
            >
              <StepCard index={index} layout="phone" step={step} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-1.5"
      >
        {steps.map((step, index) => (
          <span
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === selected ? "w-5 bg-primary" : "w-1.5 bg-input"
            )}
            key={step.key}
          />
        ))}
      </div>
    </section>
  );
}
