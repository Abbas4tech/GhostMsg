"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useCallback } from "react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import type * as z from "zod";
import { Alert, AlertDescription } from "@/components/elements/alert";
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
import type { verifySchema } from "@/schemas/verify-schema";

export type VerifyCodeValues = z.infer<typeof verifySchema>;

export const OTP_LENGTH = 6;
const OTP_SLOT_INDEXES = Array.from({ length: OTP_LENGTH }, (_, i) => i);

export interface VerifyCodeFormProps {
  /** Set after a submitted code comes back wrong (cleared on the next change). */
  codeError?: string | null;
  form: UseFormReturn<VerifyCodeValues>;
  isSubmitting?: boolean;
  onSubmit: (values: VerifyCodeValues) => void | Promise<void>;
}

/** Six large Verification Code slots, Verify button and "change email". */
export function VerifyCodeForm({
  form,
  isSubmitting = false,
  onSubmit,
  codeError,
}: VerifyCodeFormProps): React.JSX.Element {
  const renderCodeField = useCallback(
    ({ field }: { field: ControllerRenderProps<VerifyCodeValues, "code"> }) => (
      <FormItem>
        <FormLabel className="sr-only">Verification Code</FormLabel>
        <FormControl>
          <InputOTP
            autoComplete="one-time-code"
            containerClassName="w-full"
            maxLength={OTP_LENGTH}
            pattern={REGEXP_ONLY_DIGITS}
            {...field}
          >
            <InputOTPGroup className="grid w-full grid-cols-6 gap-2">
              {OTP_SLOT_INDEXES.map((index) => (
                <InputOTPSlot
                  className="h-[60px] w-full rounded-xl border border-input bg-card font-bold font-display text-[26px] tabular-nums shadow-none first:rounded-xl last:rounded-xl data-[active=true]:ring-2 data-[active=true]:ring-ring data-[active=true]:ring-offset-2 data-[active=true]:ring-offset-card"
                  index={index}
                  key={`otp-${index}`}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
    []
  );

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-[18px]"
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
            <AlertDescription>{codeError}</AlertDescription>
          </Alert>
        ) : null}
        <Button
          className="w-full rounded-full"
          disabled={!form.formState.isValid || isSubmitting}
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
        <p className="text-center text-muted-foreground text-sm">
          Wrong email?{" "}
          <Link
            className="font-semibold text-primary underline-offset-4 hover:underline"
            href="/sign-up"
          >
            Change it
          </Link>
        </p>
      </form>
    </Form>
  );
}
