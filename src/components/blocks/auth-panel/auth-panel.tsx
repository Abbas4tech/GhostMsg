import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/elements/button";
import { Progress } from "@/components/elements/progress";
import { cn } from "@/lib/utils";

export interface AuthStep {
  current: number;
  total: number;
}

export interface AuthPanelProps {
  /** "center": the verified screen (design MobVerifySuccess). Default "start". */
  align?: "center" | "start";
  /** Phones: back arrow target in the top bar (the site header hides there). */
  backHref?: string;
  /** The auth form pattern (sign-in, sign-up or verify). */
  children: React.ReactNode;
  description?: React.ReactNode;
  /** Optional icon tile above the heading (e.g. a mail icon on /verify). */
  icon?: React.ReactNode;
  /**
   * "accent": rounded tile (default). "brand": the gradient ghost tile
   * (sign-in). "success": round green mark with a pulse (verified).
   */
  iconTone?: "accent" | "brand" | "success";
  /** Phones: "1 / 2"-style progress in the top bar (sign-up → verify). */
  step?: AuthStep;
  title: React.ReactNode;
  /** Lets a screen move focus to the heading when it replaces a form. */
  titleRef?: React.Ref<HTMLHeadingElement>;
}

/** Phones only: back arrow and optional step progress (design MobSignUp / MobVerify). */
function AuthTopBar({
  backHref,
  step,
}: Pick<AuthPanelProps, "backHref" | "step">): React.JSX.Element | null {
  if (!(backHref || step)) {
    return null;
  }
  return (
    <div className="flex min-h-13 items-center gap-2 pt-2 pr-4 pl-1 sm:hidden">
      {backHref ? (
        <Button
          asChild
          className="size-11 rounded-xl"
          size="icon"
          variant="ghost"
        >
          <Link aria-label="Back" href={backHref}>
            <ChevronLeft aria-hidden="true" className="size-5.5" />
          </Link>
        </Button>
      ) : null}
      {step ? (
        <>
          <Progress
            aria-label={`Step ${step.current} of ${step.total}`}
            className="h-2 flex-1"
            value={(step.current / step.total) * 100}
          />
          <span className="text-muted-foreground text-xs tabular-nums">
            {step.current} / {step.total}
          </span>
        </>
      ) : null}
    </div>
  );
}

const ICON_TONE_CLASS = {
  accent:
    "size-13 rounded-2xl bg-accent text-accent-foreground sm:size-12 [&_svg]:size-6",
  brand:
    "size-13 rounded-2xl bg-brand-gradient text-brand-foreground sm:size-12 [&_svg]:size-6.5",
  success:
    "size-18 rounded-full bg-success text-success-foreground motion-safe:animate-pulse-ring sm:size-14 [&_svg]:size-8.5 sm:[&_svg]:size-7",
} as const;

/**
 * Desktop: one centred card on the brand mist. Phones (design MobSignUp,
 * MobSignIn, MobVerify): no card, a top bar with Back (+ progress), and the
 * form's primary action pinned to the bottom (forms use `max-sm:flex-1` and
 * the footer `max-sm:mt-auto`).
 */
export function AuthPanel({
  align = "start",
  backHref,
  step,
  title,
  titleRef,
  description,
  icon,
  iconTone = "accent",
  children,
}: AuthPanelProps): React.JSX.Element {
  const isCentered = align === "center";
  return (
    <main
      className="flex min-h-dvh flex-col sm:min-h-0 sm:items-center sm:px-4 sm:pt-10 sm:pb-16"
      data-slot="auth-panel"
    >
      <AuthTopBar backHref={backHref} step={step} />
      <section
        className={cn(
          "flex w-full flex-1 flex-col gap-5 px-4 pt-4 pb-6 sm:max-w-110 sm:flex-none sm:gap-4.5 sm:rounded-xl sm:border sm:bg-card sm:p-7 sm:text-card-foreground sm:shadow-soft",
          isCentered && "max-sm:pt-18"
        )}
      >
        <header
          className={cn(
            "flex flex-col gap-5 sm:gap-4",
            isCentered && "items-center text-center"
          )}
        >
          {icon ? (
            <span
              className={cn(
                "grid place-items-center",
                ICON_TONE_CLASS[iconTone]
              )}
            >
              {icon}
            </span>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <h1
              className="text-h1 outline-none"
              ref={titleRef}
              tabIndex={titleRef ? -1 : undefined}
            >
              {title}
            </h1>
            {description ? (
              <p
                className={cn(
                  "text-body text-muted-foreground",
                  isCentered && "mx-auto max-w-75"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
