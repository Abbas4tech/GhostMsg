import type React from "react";
import { Text } from "@/components/elements/text";

export interface AuthPanelProps {
  /** The auth form pattern (sign-in or sign-up). */
  children: React.ReactNode;
  description: React.ReactNode;
  title: React.ReactNode;
}

/** Centered auth layout: heading, muted subtitle and the form. */
export function AuthPanel({
  title,
  description,
  children,
}: AuthPanelProps): React.JSX.Element {
  return (
    <main
      className="flex items-center justify-center bg-background p-4"
      data-slot="auth-panel"
    >
      <section className="mt-8 w-full max-w-sm">
        <header className="mb-6 flex flex-col gap-2">
          <Text as="h2" variant="h2">
            {title}
          </Text>
          <Text variant="muted">{description}</Text>
        </header>
        {children}
      </section>
    </main>
  );
}

export default AuthPanel;
