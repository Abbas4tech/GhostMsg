"use client";

import type React from "react";
import { VerifyPanel } from "@/components/blocks/verify-panel";
import { VerifySuccess } from "@/components/blocks/verify-success";
import { useProfileLinkController } from "@/components/pages/dashboard/use-profile-link.controller";
import { VerifyCodeForm } from "@/components/patterns/verify-code-form";
import { useVerifyController } from "./use-verify.controller";

export interface VerifyPageProps {
  username: string;
}

export function VerifyPage({ username }: VerifyPageProps): React.JSX.Element {
  const verify = useVerifyController(username);
  const link = useProfileLinkController(username);

  if (verify.isVerified) {
    return (
      <VerifySuccess
        onCopy={link.handleCopy}
        onShare={link.handleShare}
        profileUrl={link.profileUrl}
      />
    );
  }

  return (
    <VerifyPanel username={username}>
      <VerifyCodeForm
        codeError={verify.codeError}
        form={verify.form}
        isResending={verify.isResending}
        isSubmitting={verify.isSubmitting}
        needsNewCode={verify.needsNewCode}
        onResend={verify.handleResend}
        onSubmit={verify.handleSubmit}
        resendSecondsLeft={verify.resendSecondsLeft}
      />
    </VerifyPanel>
  );
}
