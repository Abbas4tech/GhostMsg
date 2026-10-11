"use client";

import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import type * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/elements/form";
import { Input } from "@/components/elements/input";
import type { signInSchema } from "@/schemas/sign-in-schema";
import { AuthFormFooter } from "./auth-form-footer";
import { PasswordField } from "./password-field";

export type SignInValues = z.infer<typeof signInSchema>;

export interface SignInFormProps {
  form: UseFormReturn<SignInValues>;
  isSubmitting?: boolean;
  onGoogleSignIn: () => void;
  onSubmit: (values: SignInValues) => void | Promise<void>;
}

export function SignInForm({
  form,
  isSubmitting = false,
  onSubmit,
  onGoogleSignIn,
}: SignInFormProps): React.JSX.Element {
  return (
    <Form {...form}>
      <form
        className="space-y-4"
        data-slot="sign-in-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-3 md:gap-6">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username/Email *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username/email.."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <PasswordField
              control={form.control}
              name="password"
              placeholder="Enter your password.."
            />
          </div>
        </div>

        <AuthFormFooter
          alternateHref="/sign-up"
          alternateLabel="Create an account!"
          isSubmitDisabled={!form.formState.isValid || isSubmitting}
          isSubmitting={isSubmitting}
          onGoogleSignIn={onGoogleSignIn}
          submitLabel="Login"
          submittingLabel="Logging in..."
        />
      </form>
    </Form>
  );
}

export default SignInForm;
