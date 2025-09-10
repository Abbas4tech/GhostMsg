"use client";
import { SessionProvider } from "next-auth/react";
import React, { PropsWithChildren } from "react";

export default function AuthProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
