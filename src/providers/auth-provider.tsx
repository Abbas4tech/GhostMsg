"use client";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type React from "react";
import type { PropsWithChildren } from "react";

export interface AuthProviderProps extends PropsWithChildren {
  /**
   * Session already read on the server (`getServerSession`): the subtree
   * starts "authenticated" without a client round trip. Omit to fetch it.
   */
  session?: Session | null;
}

export default function AuthProvider({
  children,
  session,
}: AuthProviderProps): React.JSX.Element {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
