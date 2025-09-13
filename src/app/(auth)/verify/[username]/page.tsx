"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import * as z from "zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { verifySchema } from "@/schemas/verifySchema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const VerifyUserPage = (): React.JSX.Element => {
  const params = useParams<{ username: string }>();

  const onSubmit: SubmitHandler<z.infer<typeof verifySchema>> = (_data) => {};

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
    mode: "onSubmit",
  });
  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-background">
      <Card className="max-w-lg w-full">
        <CardHeader className="">
          <CardTitle className="text-xl md:text-3xl font-bold">
            Verify Your account!
          </CardTitle>
          <CardDescription>
            {`Hi ${params.username}, Please enter the one-time password sent to your email.`}
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <CardContent className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP
                        pattern={REGEXP_ONLY_DIGITS}
                        maxLength={6}
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
              <Button disabled={!form.formState.isValid} type="submit">
                Submit
              </Button>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default VerifyUserPage;
