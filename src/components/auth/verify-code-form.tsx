"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
import type React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import type * as z from "zod";
import { CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useVerifyCodeMutation } from "@/hooks/mutations/use-verify-code-mutation";
import { verifySchema } from "@/schemas/verify-schema";
import { Button } from "../animate-ui/components/buttons/button";

interface VerifyCodeFormProps {
  username: string;
}

const VerifyCodeForm = ({
  username,
}: VerifyCodeFormProps): React.JSX.Element => {
  const router = useRouter();
  const verifyMutation = useVerifyCodeMutation();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<z.infer<typeof verifySchema>> = async (
    data
  ) => {
    try {
      const res = await verifyMutation.mutateAsync({
        username,
        code: data.code,
      });

      if (res?.success) {
        toast.success(res.message);
        router.replace("/sign-in");
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Verification failed");
    }
  };

  const isSubmitting = verifyMutation.isPending;

  return (
    <Form {...form}>
      <form className="w-full space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    {...field}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
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
};

export default VerifyCodeForm;
