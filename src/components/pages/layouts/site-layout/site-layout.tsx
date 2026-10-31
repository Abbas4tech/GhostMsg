"use client";

import { signOut, useSession } from "next-auth/react";
import type React from "react";
import { useCallback } from "react";
import { SiteHeader } from "@/components/blocks/site-header";
import { cn } from "@/lib/utils";

export interface SiteLayoutProps {
  children?: React.ReactNode;
  /**
   * Auth routes: phones show the screen's own Back / progress bar instead of
   * the site header (design MobSignIn, MobSignUp, MobVerify).
   */
  hideHeaderOnPhones?: boolean;
}

/** Wires the session into the pure SiteHeader; page sits below on the brand mist. */
export function SiteLayout({
  children,
  hideHeaderOnPhones = false,
}: SiteLayoutProps): React.JSX.Element {
  const { status } = useSession();
  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  return (
    <div className="min-h-screen bg-brand-mist">
      <div className={cn(hideHeaderOnPhones && "max-sm:hidden")}>
        <SiteHeader
          isAuthenticated={status === "authenticated"}
          onSignOut={handleSignOut}
        />
      </div>
      {children}
    </div>
  );
}
