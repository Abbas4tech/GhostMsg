"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import type * as z from "zod";
import { Button } from "@/components/elements/button";
import { CardContent } from "@/components/elements/card";
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
  form: UseFormReturn<VerifyCodeValues>;
  isSubmitting?: boolean;
  onSubmit: (values: VerifyCodeValues) => void | Promise<void>;
}

/** 6-digit OTP form. Renders inside a Card (uses CardContent spacing). */
export function VerifyCodeForm({
  form,
  isSubmitting = false,
  onSubmit,
}: VerifyCodeFormProps): React.JSX.Element {
  return (
    <Form {...form}>
      <form
        className="w-full space-y-6"
        data-slot="verify-code-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <CardContent className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={OTP_LENGTH}
                    pattern={REGEXP_ONLY_DIGITS}
                    {...field}
                  >
                    <InputOTPGroup>
                      {OTP_SLOT_INDEXES.map((index) => (
                        <InputOTPSlot index={index} key={`otp-${index}`} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={!form.formState.isValid || isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Checking your OTP..." : "Submit"}
          </Button>
        </CardContent>
      </form>
    </Form>
  );
}

export default VerifyCodeForm;
