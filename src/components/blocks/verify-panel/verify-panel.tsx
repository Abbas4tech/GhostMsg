import { Mail } from "lucide-react";
import type React from "react";
import { AuthPanel } from "@/components/blocks/auth-panel";

/** Sign-up is step 1, the Verification Code step 2. */
const VERIFY_STEP = { current: 2, total: 2 } as const;

export interface VerifyPanelProps {
  /** The verify-code form pattern. */
  children: React.ReactNode;
  username: string;
}

/**
 * "Check your email" card around the 6-digit Verification Code form. Phones:
 * Back to /sign-up and step 2 of 2 in the top bar (design MobVerify).
 */
export function VerifyPanel({
  username,
  children,
}: VerifyPanelProps): React.JSX.Element {
  return (
    <div data-slot="verify-panel">
      <AuthPanel
        backHref="/sign-up"
        description={
          <>
            We sent a 6-digit Verification Code to the email you used for{" "}
            <b className="font-semibold text-foreground">@{username}</b>.
          </>
        }
        icon={<Mail aria-hidden="true" />}
        step={VERIFY_STEP}
        title="Check your email"
      >
        {children}
      </AuthPanel>
    </div>
  );
}
