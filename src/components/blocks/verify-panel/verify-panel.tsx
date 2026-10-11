import type React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";

export interface VerifyPanelProps {
  /** The verify-code form pattern (renders its own CardContent). */
  children: React.ReactNode;
  username: string;
}

/** Account verification card with greeting and OTP form slot. */
export function VerifyPanel({
  username,
  children,
}: VerifyPanelProps): React.JSX.Element {
  return (
    <div
      className="flex items-center justify-center bg-background p-4"
      data-slot="verify-panel"
    >
      <Card className="mt-16 w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-bold text-xl md:text-2xl">
            Verify Your account!
          </CardTitle>
          <CardDescription>
            {`Hi ${username}, Please enter the one-time password sent to your email.`}
          </CardDescription>
        </CardHeader>
        {children}
      </Card>
    </div>
  );
}

export default VerifyPanel;
