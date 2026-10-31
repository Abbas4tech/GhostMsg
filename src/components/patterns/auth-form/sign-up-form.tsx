"use client";

import { Mail } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
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
  const renderEmailField = useCallback(
    ({ field }: { field: ControllerRenderProps<SignUpValues, "email"> }) => (
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
    ),
    []
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 max-sm:flex-1"
        data-slot="sign-up-form"
        noValidate
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
          render={renderEmailField}
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
            !form.formState.isValid ||
            isSubmitting ||
            isCheckingUsername ||
            usernameAvailability === "taken"
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
