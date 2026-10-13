"use client";

import { Mail } from "lucide-react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/elements/input-group";
import {
  type UsernameAvailability,
  UsernameField,
} from "@/components/patterns/username-field";
import type { signUpSchema } from "@/schemas/sign-up-schema";
import { AuthFormFooter, AuthOAuthHeader } from "./auth-form-footer";
import { PasswordField } from "./password-field";

export type SignUpValues = z.infer<typeof signUpSchema>;

export interface SignUpFormProps {
  form: UseFormReturn<SignUpValues>;
  isSubmitting?: boolean;
  /** Host + path the username is appended to, e.g. "ghostmsg.app/u/". */
  linkPrefix?: string;
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
  linkPrefix,
  usernameAvailability = "idle",
  usernameAvailabilityMessage,
}: SignUpFormProps): React.JSX.Element {
  const isCheckingUsername = usernameAvailability === "checking";

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        data-slot="sign-up-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AuthOAuthHeader onGoogleSignIn={onGoogleSignIn} />

        <UsernameField
          availability={usernameAvailability}
          availabilityMessage={usernameAvailabilityMessage}
          control={form.control}
          linkPrefix={linkPrefix}
          name="username"
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <InputGroup size="lg">
                <InputGroupAddon>
                  <Mail aria-hidden="true" />
                </InputGroupAddon>
                <FormControl>
                  <InputGroupInput
                    autoComplete="email"
                    placeholder="maya@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
              </InputGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <PasswordField
          autoComplete="new-password"
          control={form.control}
          hint="8+ characters. A passphrase works best."
          name="password"
          placeholder="Choose a password"
        />

        <AuthFormFooter
          alternateHref="/sign-in"
          alternateLabel="Sign in"
          alternatePrompt="Already have a link?"
          isSubmitDisabled={
            !form.formState.isValid || isSubmitting || isCheckingUsername
          }
          isSubmitting={isSubmitting}
          submitLabel="Send my Verification Code"
          submittingLabel="Creating your link..."
          submitVariant="brand"
        />
      </form>
    </Form>
  );
}

export default SignUpForm;
