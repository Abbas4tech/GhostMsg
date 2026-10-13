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
import {
  type UsernameAvailability,
  UsernameField,
} from "@/components/patterns/username-field";
import type { signUpSchema } from "@/schemas/sign-up-schema";
import { AuthFormFooter } from "./auth-form-footer";
import { PasswordField } from "./password-field";

export type SignUpValues = z.infer<typeof signUpSchema>;

export interface SignUpFormProps {
  form: UseFormReturn<SignUpValues>;
  isSubmitting?: boolean;
  onGoogleSignIn: () => void;
  onSubmit: (values: SignUpValues) => void | Promise<void>;
  usernameAvailability?: UsernameAvailability;
  usernameAvailabilityMessage?: string;
}

export function SignUpForm({
  form,
  isSubmitting = false,
  onSubmit,
  onGoogleSignIn,
  usernameAvailability = "idle",
  usernameAvailabilityMessage,
}: SignUpFormProps): React.JSX.Element {
  const isCheckingUsername = usernameAvailability === "checking";

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        data-slot="sign-up-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-3 md:gap-6">
          <div className="grid gap-2">
            <UsernameField
              availability={usernameAvailability}
              availabilityMessage={usernameAvailabilityMessage}
              control={form.control}
              name="username"
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please choose your email.."
                      type="email"
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
              placeholder="Please choose your password.."
            />
          </div>
        </div>

        <AuthFormFooter
          alternateHref="/sign-in"
          alternateLabel="Already a member? Try logging in!"
          isSubmitDisabled={
            !form.formState.isValid || isSubmitting || isCheckingUsername
          }
          isSubmitting={isSubmitting}
          onGoogleSignIn={onGoogleSignIn}
          submitLabel="Sign up"
          submittingLabel="Signing up..."
        />
      </form>
    </Form>
  );
}

export default SignUpForm;
