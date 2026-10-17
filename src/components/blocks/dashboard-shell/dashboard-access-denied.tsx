"use client";

import { Lock } from "lucide-react";
import type React from "react";
import { Button } from "@/components/elements/button";
import { BrandMark } from "@/components/patterns/brand-mark";

export interface DashboardAccessDeniedProps {
  onGoToLogin: () => void;
}

/** Shown when a signed-out visitor reaches the dashboard. */
export function DashboardAccessDenied({
  onGoToLogin,
}: DashboardAccessDeniedProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-brand-mist px-4">
      <BrandMark href="/" />
      <section className="flex w-full max-w-[400px] flex-col items-center gap-4 rounded-xl border bg-card p-7 text-center text-card-foreground shadow-soft">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Lock aria-hidden="true" className="size-6" />
        </span>
        <h1 className="font-bold text-[26px] leading-tight tracking-tight">
          Sign in to see your inbox
        </h1>
        <p className="text-muted-foreground">
          Your Anonymous Messages are only visible to you.
        </p>
        <Button className="w-full rounded-full" onClick={onGoToLogin} size="xl">
          Sign in
        </Button>
      </section>
    </div>
  );
}
