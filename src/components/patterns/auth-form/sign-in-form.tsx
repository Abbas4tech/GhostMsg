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
import type { signInSchema } from "@/schemas/sign-in-schema";
import { AuthFormFooter, AuthOAuthHeader } from "./auth-form-footer";
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
  const renderIdentifierField = useCallback(
    ({
      field,
    }: {
      field: ControllerRenderProps<SignInValues, "identifier">;
    }) => (
      <FormItem>
        <FormLabel>Username or email</FormLabel>
        <InputGroup size="lg">
          <InputGroupAddon>
            <Mail aria-hidden="true" />
          </InputGroupAddon>
          <FormControl>
            <InputGroupInput
              autoCapitalize="none"
              autoComplete="username"
              placeholder="maya@example.com"
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
        className="flex flex-col gap-4"
        data-slot="sign-in-form"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <AuthOAuthHeader onGoogleSignIn={onGoogleSignIn} />

        <FormField
          control={form.control}
          name="identifier"
          render={renderIdentifierField}
        />

        <PasswordField
          control={form.control}
          name="password"
          placeholder="Your password"
        />

        <AuthFormFooter
          alternateHref="/sign-up"
          alternateLabel="Get your link"
          alternatePrompt="New here?"
          isSubmitDisabled={!form.formState.isValid || isSubmitting}
          isSubmitting={isSubmitting}
          submitLabel="Sign in"
          submittingLabel="Signing in..."
        />
      </form>
    </Form>
  );
}
