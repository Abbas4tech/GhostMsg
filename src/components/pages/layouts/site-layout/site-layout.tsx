"use client";

import { signOut, useSession } from "next-auth/react";
import type React from "react";
import { useCallback } from "react";
import { SiteHeader } from "@/components/blocks/site-header";

export interface SiteLayoutProps {
  children?: React.ReactNode;
}

/** Wires the session into the pure SiteHeader and renders the page below it. */
export function SiteLayout({ children }: SiteLayoutProps): React.JSX.Element {
  const { status } = useSession();
  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  return (
    <>
      <SiteHeader
        isAuthenticated={status === "authenticated"}
        onSignOut={handleSignOut}
      />
      {children}
    </>
  );
}

export default SiteLayout;
