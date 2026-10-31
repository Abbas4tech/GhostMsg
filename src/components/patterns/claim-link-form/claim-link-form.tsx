"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useCallback, useId } from "react";
import { Button } from "@/components/elements/button";
import { cn } from "@/lib/utils";

export interface ClaimLinkFormProps {
  className?: string;
  /** Host + path shown before the input, e.g. "ghostmsg.app/u/". */
  linkPrefix: string;
  /** Optional example profile ("See a live profile"). */
  liveProfileHref?: string;
  onSubmit: () => void;
  onValueChange: (value: string) => void;
  value: string;
}

/**
 * Landing hero form: type a username, continue to sign-up with it. Phones
 * (design MobLanding): the field and a full-width "Get my link" stack.
 */
export function ClaimLinkForm({
  linkPrefix,
  value,
  onValueChange,
  onSubmit,
  liveProfileHref,
  className,
}: ClaimLinkFormProps): React.JSX.Element {
  const inputId = useId();
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit();
    },
    [onSubmit]
  );
  const handleValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(event.target.value);
    },
    [onValueChange]
  );

  return (
    <form
      aria-label="Claim your link"
      className={cn(
        "mt-1 flex w-full max-w-[520px] flex-col gap-2.5 sm:mt-0 sm:gap-3",
        className
      )}
      data-slot="claim-link-form"
      noValidate
      onSubmit={handleSubmit}
    >
      <label className="font-semibold text-sm" htmlFor={inputId}>
        Claim your Public Profile Link
      </label>
      <div className="flex flex-wrap gap-2.5">
        <div className="flex min-h-12 flex-[1_1_260px] items-center rounded-[14px] border border-input bg-card px-4 focus-within:outline-2 focus-within:outline-ring focus-within:outline-offset-2 sm:rounded-full sm:px-[18px]">
          <span className="shrink-0 text-body text-muted-foreground">
            {linkPrefix}
          </span>
          <input
            autoCapitalize="none"
            autoComplete="username"
            className="min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-muted-foreground/70"
            id={inputId}
            onChange={handleValueChange}
            placeholder="yourname"
            spellCheck={false}
            type="text"
            value={value}
          />
        </div>
        <Button
          className="rounded-full max-sm:h-13 max-sm:w-full"
          size="xl"
          type="submit"
          variant="brand"
        >
          Get my link
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
      <p className="text-muted-foreground text-sm max-sm:text-center max-sm:text-xs">
        Free. Takes about 30 seconds.
        {liveProfileHref ? (
          <>
            {" "}
            <Link
              className="font-bold text-primary underline-offset-4 hover:underline sm:font-semibold"
              href={liveProfileHref}
            >
              See a live profile
            </Link>
          </>
        ) : null}
      </p>
    </form>
  );
}
