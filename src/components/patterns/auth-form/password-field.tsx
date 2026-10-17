"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";
import type {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/elements/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/elements/input-group";

export interface PasswordFieldProps<TFieldValues extends FieldValues> {
  autoComplete?: "current-password" | "new-password";
  control: Control<TFieldValues>;
  /** Helper line under the field (e.g. "8+ characters…"). */
  hint?: string;
  name: FieldPath<TFieldValues>;
  placeholder: string;
}

/** Password input with a lock icon and a Show/Hide toggle (local UI state). */
export function PasswordField<TFieldValues extends FieldValues>({
  control,
  name,
  placeholder,
  hint,
  autoComplete = "current-password",
}: PasswordFieldProps<TFieldValues>): React.JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const handleToggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);
  const renderField = useCallback(
    ({
      field,
    }: {
      field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
    }) => (
      <FormItem>
        <FormLabel>Password</FormLabel>
        <InputGroup size="lg">
          <InputGroupAddon>
            <Lock aria-hidden="true" />
          </InputGroupAddon>
          <FormControl>
            <InputGroupInput
              autoComplete={autoComplete}
              placeholder={placeholder}
              type={showPassword ? "text" : "password"}
              {...field}
            />
          </FormControl>
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={handleToggleShowPassword}
              size="sm"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {hint ? <FormDescription>{hint}</FormDescription> : null}
        <FormMessage />
      </FormItem>
    ),
    [autoComplete, placeholder, showPassword, hint, handleToggleShowPassword]
  );

  return <FormField control={control} name={name} render={renderField} />;
}
