"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { AlertCircle, Clock, Loader2, RefreshCw } from "lucide-react";
import { motion, useAnimation } from "motion/react";
import Link from "next/link";
import type React from "react";
import { useCallback, useEffect } from "react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import type * as z from "zod";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/elements/alert";
import { Button } from "@/components/elements/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/elements/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/elements/input-otp";
import { shake } from "@/lib/motion";
import { formatCountdown } from "@/lib/users/verification";
import type { verifySchema } from "@/schemas/verify-schema";

export type VerifyCodeValues = z.infer<typeof verifySchema>;

/** A failed attempt: bold title plus an optional hint ("2 tries left. …"). */
export interface VerifyCodeError {
  detail?: string;
  title: string;
}

export const OTP_LENGTH = 6;
const OTP_SLOT_INDEXES = Array.from({ length: OTP_LENGTH }, (_, i) => i);

export interface VerifyCodeFormProps {
  /** Set after a submitted code comes back wrong (cleared on the next change). */
  codeError?: VerifyCodeError | null;
  form: UseFormReturn<VerifyCodeValues>;
  isResending?: boolean;
  isSubmitting?: boolean;
  /** Locked (no tries left) or expired: slots disabled, only "Resend code". */
  needsNewCode?: boolean;
  onResend: () => void | Promise<void>;
  onSubmit: (values: VerifyCodeValues) => void | Promise<void>;
  /** Seconds until "Resend code" unlocks (0 = available). */
  resendSecondsLeft?: number;
}

/** Design `.btn[data-s=lg]`: 52px on phones, a pill on desktop. */
const ACTION_CLASS = "w-full rounded-full max-sm:h-13";

interface ResendProps {
  isResending: boolean;
  onResend: () => void | Promise<void>;
  resendSecondsLeft: number;
}

function ResendButton({
  isResending,
  onResend,
  resendSecondsLeft,
}: ResendProps): React.JSX.Element {
  const isCooling = resendSecondsLeft > 0;
  return (
    <Button
      className={ACTION_CLASS}
      disabled={isCooling || isResending}
      onClick={onResend}
      size="xl"
      type="button"
      variant="secondary"
    >
      {isResending ? (
        <Loader2 aria-hidden="true" className="animate-spin" />
      ) : (
        <RefreshCw aria-hidden="true" />
      )}
      {isCooling ? (
        <span className="tabular-nums">
          Resend in {formatCountdown(resendSecondsLeft)}
        </span>
      ) : (
        "Resend code"
      )}
    </Button>
  );
}

/** "Didn't get it? Resend in 0:42" (desktop) / "⏱ Resend in 0:42" (phones). */
function ResendHint({
  isResending,
  onResend,
  resendSecondsLeft,
}: ResendProps): React.JSX.Element {
  return (
    <p className="flex items-center gap-1.5 text-muted-foreground text-sm sm:order-1 sm:justify-center">
      <Clock aria-hidden="true" className="size-4 sm:hidden" />
      <span className="max-sm:hidden">Didn&apos;t get it?</span>
      {resendSecondsLeft > 0 ? (
        <span>
          Resend in{" "}
          <b className="font-bold text-foreground tabular-nums">
            {formatCountdown(resendSecondsLeft)}
          </b>
        </span>
      ) : (
        <Button
          className="h-auto p-0 font-semibold"
          disabled={isResending}
          onClick={onResend}
          type="button"
          variant="link"
        >
          Resend code
        </Button>
      )}
    </p>
  );
}

/**
 * Six large Verification Code slots with one main action (design Auth board,
 * MobVerify, MobVerifyError): Verify while a code is typed or the timer runs;
 * "Resend code" once the timer ends with no full code, after a wrong code, or
 * when the code is locked or expired. A wrong code shakes the slots once and
 * turns them red until the next keystroke.
 */
export function VerifyCodeForm({
  form,
  isResending = false,
  isSubmitting = false,
  needsNewCode = false,
  onResend,
  onSubmit,
  codeError,
  resendSecondsLeft = 0,
}: VerifyCodeFormProps): React.JSX.Element {
  const shakeControls = useAnimation();
  const hasCodeError = Boolean(codeError);
  const isComplete = form.formState.isValid;
  const canResend = resendSecondsLeft === 0;
  const showResend = needsNewCode || hasCodeError || (canResend && !isComplete);

  // A wrong code shakes the slots once (design: x ±5/±3 over 160ms).
  useEffect(() => {
    if (hasCodeError) {
      shakeControls.start("shake");
    }
  }, [hasCodeError, shakeControls]);

  const renderCodeField = useCallback(
    ({ field }: { field: ControllerRenderProps<VerifyCodeValues, "code"> }) => (
      <FormItem>
        <FormLabel className="sr-only">Verification Code</FormLabel>
        {/* The shake wraps FormControl, so the label stays on the input. */}
        <motion.div animate={shakeControls} initial="idle" variants={shake}>
          <FormControl>
            <InputOTP
              autoComplete="one-time-code"
              containerClassName="w-full"
              disabled={needsNewCode}
              maxLength={OTP_LENGTH}
              pattern={REGEXP_ONLY_DIGITS}
              {...field}
            >
              <InputOTPGroup className="grid w-full grid-cols-6 gap-2">
                {OTP_SLOT_INDEXES.map((index) => (
                  <InputOTPSlot
                    aria-invalid={hasCodeError}
                    className="h-15 w-full rounded-xl border border-input bg-card font-bold font-display text-[26px] tabular-nums shadow-none first:rounded-xl last:rounded-xl aria-invalid:text-destructive data-[active=true]:ring-2 data-[active=true]:ring-ring data-[active=true]:ring-offset-2 data-[active=true]:ring-offset-card"
                    index={index}
                    key={`otp-${index}`}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
        </motion.div>
        <FormMessage />
      </FormItem>
    ),
    [hasCodeError, needsNewCode, shakeControls]
  );

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-4.5 max-sm:flex-1 max-sm:gap-5"
        data-slot="verify-code-form"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="code"
          render={renderCodeField}
        />
        {codeError ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle className="font-bold">{codeError.title}</AlertTitle>
            {codeError.detail ? (
              <AlertDescription>{codeError.detail}</AlertDescription>
            ) : null}
          </Alert>
        ) : null}
        {showResend ? null : (
          <ResendHint
            isResending={isResending}
            onResend={onResend}
            resendSecondsLeft={resendSecondsLeft}
          />
        )}
        {/* Phones: the action and "Change it" sit at the bottom (design MobVerify). */}
        <div className="flex flex-col gap-3 max-sm:mt-auto sm:contents">
          {showResend ? (
            <ResendButton
              isResending={isResending}
              onResend={onResend}
              resendSecondsLeft={resendSecondsLeft}
            />
          ) : (
            <Button
              className={ACTION_CLASS}
              disabled={!isComplete || isSubmitting}
              size="xl"
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  Checking your code...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          )}
          <Link
            className="text-center text-muted-foreground text-sm underline-offset-4 hover:underline max-sm:flex max-sm:h-13 max-sm:items-center max-sm:justify-center max-sm:gap-1 max-sm:rounded-full max-sm:font-semibold max-sm:text-body max-sm:text-foreground max-sm:hover:bg-accent max-sm:hover:no-underline sm:order-2"
            href="/sign-up"
          >
            Wrong email?{" "}
            <span className="font-semibold sm:text-primary">Change it</span>
          </Link>
        </div>
      </form>
    </Form>
  );
}
