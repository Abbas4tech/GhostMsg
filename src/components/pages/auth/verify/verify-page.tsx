"use client";

import type React from "react";
import { VerifyPanel } from "@/components/blocks/verify-panel";
import { VerifyCodeForm } from "@/components/patterns/verify-code-form";
import { useVerifyController } from "./use-verify.controller";

export interface VerifyPageProps {
  username: string;
}

export function VerifyPage({ username }: VerifyPageProps): React.JSX.Element {
  const verify = useVerifyController(username);

  return (
    <VerifyPanel username={username}>
      <VerifyCodeForm
        codeError={verify.codeError}
        form={verify.form}
        isSubmitting={verify.isSubmitting}
        onSubmit={verify.handleSubmit}
      />
    </VerifyPanel>
  );
}
