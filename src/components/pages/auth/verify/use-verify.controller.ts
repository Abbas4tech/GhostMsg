"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { notify } from "@/components/elements/sonner";
import type {
  VerifyCodeError,
  VerifyCodeValues,
} from "@/components/patterns/verify-code-form";
import { useResendCodeMutation } from "@/data/auth/use-resend-code-mutation";
import { useVerifyCodeMutation } from "@/data/auth/use-verify-code-mutation";
import { verifySchema } from "@/schemas/verify-schema";
import { useResendCooldownController } from "./use-resend-cooldown.controller";
import {
  readRetryAfter,
  toVerifyFailure,
  toVerifyFailureFromError,
  type VerifyFailure,
} from "./verify.utils";

/**
 * The /verify screen: the 6-digit code (three tries per code), the resend
 * cooldown, and the "You're in" state once the code checks out. Verifying
 * doesn't sign in; the success screen links to /sign-in.
 */
export function useVerifyController(username: string) {
  const verifyMutation = useVerifyCodeMutation();
  const resendMutation = useResendCodeMutation();
  const cooldown = useResendCooldownController();
  const [codeError, setCodeError] = useState<VerifyCodeError | null>(null);
  const [needsNewCode, setNeedsNewCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const form = useForm<VerifyCodeValues>({
    defaultValues: { code: "" },
    mode: "onChange",
    resolver: zodResolver(verifySchema),
  });

  // A wrong code clears on the next keystroke (design: "clear on the next keystroke").
  const codeValue = form.watch("code");
  // biome-ignore lint/correctness/useExhaustiveDependencies: codeValue drives the reset, intentionally unread in the body
  useEffect(() => {
    setCodeError(null);
  }, [codeValue]);

  const showFailure = useCallback((failure: VerifyFailure) => {
    setCodeError(failure.error);
    setNeedsNewCode(failure.needsNewCode);
  }, []);

  const { mutateAsync: verifyAsync } = verifyMutation;
  const handleSubmit = useCallback(
    async ({ code }: VerifyCodeValues) => {
      setCodeError(null);
      try {
        const res = await verifyAsync({ code, username });
        if (res?.success) {
          setIsVerified(true);
          return;
        }
        showFailure(toVerifyFailure(res ?? {}));
      } catch (error) {
        showFailure(toVerifyFailureFromError(error));
      }
    },
    [showFailure, username, verifyAsync]
  );

  const { mutateAsync: resendAsync } = resendMutation;
  const { restart } = cooldown;
  const handleResend = useCallback(async () => {
    try {
      const res = await resendAsync({ username });
      restart(res.retryAfterSeconds);
      setNeedsNewCode(false);
      form.reset({ code: "" });
      setCodeError(null);
      notify.success(res.message);
    } catch (error) {
      const retryAfter = readRetryAfter(error);
      if (retryAfter) {
        restart(retryAfter);
      }
      const message = error instanceof Error ? error.message : "";
      notify.error(message || "Couldn't send a new code. Try again.");
    }
  }, [form, resendAsync, restart, username]);

  return {
    codeError,
    form,
    handleResend,
    handleSubmit,
    isResending: resendMutation.isPending,
    isSubmitting: verifyMutation.isPending,
    isVerified,
    needsNewCode,
    resendSecondsLeft: cooldown.secondsLeft,
  };
}
