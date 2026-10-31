"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/elements/button";
import { BrandMark } from "@/components/patterns/brand-mark";

export interface SiteHeaderProps {
  isAuthenticated: boolean;
  onSignOut: () => void;
}

/**
 * Global header: brand and primary nav (Safety / Sign in / Get your link, or
 * Dashboard / Log out when signed in). Palettes and the theme live in
 * Settings → Appearance only.
 */
export function SiteHeader({
  isAuthenticated,
  onSignOut,
}: SiteHeaderProps): React.JSX.Element {
  return (
    <header
      className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-5 sm:px-6"
      data-slot="site-header"
    >
      <BrandMark href="/" />

      <nav
        aria-label="Primary"
        className="flex flex-wrap items-center gap-1 sm:gap-2"
      >
        {isAuthenticated ? (
          <>
            <Button asChild className="rounded-full" variant="ghost">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              className="rounded-full"
              onClick={onSignOut}
              variant="outline"
            >
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button
              asChild
              className="hidden rounded-full sm:inline-flex"
              variant="ghost"
            >
              <Link href="/#safety">Safety</Link>
            </Button>
            <Button asChild className="rounded-full" variant="ghost">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="hidden rounded-full sm:inline-flex">
              <Link href="/sign-up">Get your link</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
