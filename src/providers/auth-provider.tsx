"use client";
import { SessionProvider } from "next-auth/react";
import type React from "react";
import type { PropsWithChildren } from "react";

export default function AuthProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
