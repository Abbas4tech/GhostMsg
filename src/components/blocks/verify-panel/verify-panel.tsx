import { Mail } from "lucide-react";
import type React from "react";
import { AuthPanel } from "@/components/blocks/auth-panel";

export interface VerifyPanelProps {
  /** The verify-code form pattern. */
  children: React.ReactNode;
  username: string;
}

/** "Check your email" card around the 6-digit Verification Code form. */
export function VerifyPanel({
  username,
  children,
}: VerifyPanelProps): React.JSX.Element {
  return (
    <div data-slot="verify-panel">
      <AuthPanel
        description={
          <>
            We sent a 6-digit Verification Code to the email you used for{" "}
            <b className="font-semibold text-foreground">@{username}</b>.
          </>
        }
        icon={<Mail aria-hidden="true" />}
        title="Check your email"
      >
        {children}
      </AuthPanel>
    </div>
  );
}
