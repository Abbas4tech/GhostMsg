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

const stepCardInner = "flex min-h-[178px] flex-col gap-3 p-4";
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
  const steps = [
    {
      content: (
        <div className={stepCardInner}>
          <span className={stepTitle}>1 · Share your link</span>
          <span className="flex min-h-11 items-center gap-2 rounded-full border border-input px-3.5 text-sm">
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
        </div>
      ),
      key: "share",
      label: "Step 1 · Share your link",
    },
    {
      content: (
        <div className={stepCardInner} data-step="receive">
          <span className={stepTitle}>2 · Receive</span>
          <div className="relative flex flex-col gap-2 rounded-xl border bg-card p-3 before:absolute before:top-4 before:-left-px before:h-5 before:w-1 before:rounded-r before:bg-primary">
            <SentimentBadge className="self-start" sentiment={sentiment} />
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        </div>
      ),
      key: "receive",
      label: "Step 2 · Receive",
    },
    {
      content: (
        <div className={stepCardInner}>
          <span className={stepTitle}>3 · Answer</span>
          <p className="min-h-16 rounded-[14px] border border-input px-3 py-2.5 text-sm">
            {answer}
          </p>
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
            Smart Reply suggestions
          </span>
        </div>
      ),
      key: "answer",
      label: "Step 3 · Answer",
    },
    {
      content: (
        <div
          className={cn(
            stepCardInner,
            "justify-between rounded-xl bg-brand-gradient text-brand-foreground shadow-lift"
          )}
        >
          <span className="font-bold text-xs uppercase tracking-wider">
            4 · Share as Story Card
          </span>
          <p className="font-display text-lg leading-tight">
            &ldquo;{message}&rdquo;
          </p>
          <span className="font-semibold text-xs">{profileLabel}</span>
        </div>
      ),
      key: "story-card",
      label: "Step 4 · Share as Story Card",
    },
  ];

  return (
    <div className={className} data-slot="how-it-works">
      <ol
        aria-label="How GhostMsg works in four steps"
        className="hidden grid-cols-2 gap-3.5 sm:grid"
      >
        {steps.map((step, index) => (
          <li
            className={cn(
              "rounded-xl border bg-card text-card-foreground shadow-soft motion-safe:animate-rise",
              (index === 1 || index === 3) && "mt-7"
            )}
            data-slot="how-it-works-step"
            key={step.key}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {step.content}
          </li>
        ))}
      </ol>
      <HowItWorksMobile steps={steps} />
    </div>
  );
}

function HowItWorksMobile({
  steps,
}: {
  steps: { content: React.ReactNode; key: string; label: string }[];
}): React.JSX.Element {
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
    <div className="sm:hidden">
      <div className="mb-2 flex items-center justify-between">
        <span className={stepTitle}>{steps[selected]?.label}</span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {selected + 1} / {steps.length}
        </span>
      </div>
      <Carousel opts={{ align: "start" }} setApi={setApi}>
        <CarouselContent>
          {steps.map((step) => (
            <CarouselItem className="basis-[88%]" key={step.key}>
              <div className="rounded-xl border bg-card text-card-foreground shadow-soft">
                {step.content}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {steps.map((step, index) => (
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full transition-colors",
              index === selected ? "bg-primary" : "bg-border"
            )}
            key={step.key}
          />
        ))}
      </div>
    </div>
  );
}
