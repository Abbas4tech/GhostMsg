"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import type {
  Control,
  FieldPath,
  FieldValues,
  UseFormClearErrors,
  UseFormSetError,
} from "react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authQueries } from "@/queries/auth.queries";

interface UsernameFieldProps<TFieldValues extends FieldValues> {
  clearErrors?: UseFormClearErrors<TFieldValues>;
  control: Control<TFieldValues>;
  name?: FieldPath<TFieldValues>;
  onCheckingChange?: (isChecking: boolean) => void;
  setError?: UseFormSetError<TFieldValues>;
}

export function UsernameField<TFieldValues extends FieldValues>({
  control,
  name = "username" as FieldPath<TFieldValues>,
  setError,
  clearErrors,
  onCheckingChange,
}: UsernameFieldProps<TFieldValues>): React.JSX.Element {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <UsernameInputInner
          clearErrors={clearErrors}
          field={field}
          name={name}
          onCheckingChange={onCheckingChange}
          setError={setError}
        />
      )}
    />
  );
}

interface UsernameInputInnerProps<TFieldValues extends FieldValues> {
  clearErrors?: UseFormClearErrors<TFieldValues>;
  field: {
    name: string;
    onBlur: () => void;
    onChange: (_event: React.ChangeEvent<HTMLInputElement>) => void;
    ref: React.Ref<HTMLInputElement>;
    value: string;
  };
  name: FieldPath<TFieldValues>;
  onCheckingChange?: (isChecking: boolean) => void;
  setError?: UseFormSetError<TFieldValues>;
}

function UsernameInputInner<TFieldValues extends FieldValues>({
  field,
  name,
  setError,
  clearErrors,
  onCheckingChange,
}: UsernameInputInnerProps<TFieldValues>): React.JSX.Element {
  const [debouncedUsername, setDebouncedUsername] = useDebounceValue(
    field.value || "",
    400
  );

  useEffect(() => {
    setDebouncedUsername(field.value || "");
  }, [field.value, setDebouncedUsername]);

  const isValidLength = Boolean(
    debouncedUsername && debouncedUsername.trim().length >= 2
  );

  const {
    data: validationData,
    isFetching: isCheckingUsername,
    error: queryError,
  } = useQuery({
    ...authQueries.checkUsername(debouncedUsername),
    enabled: isValidLength,
  });

  useEffect(() => {
    onCheckingChange?.(isCheckingUsername);
  }, [isCheckingUsername, onCheckingChange]);

  useEffect(() => {
    if (!isValidLength) {
      return;
    }

    if (queryError) {
      setError?.(name, {
        type: "manual",
        message: queryError.message || "Username is already taken or invalid",
      });
    } else if (validationData?.success) {
      clearErrors?.(name);
    }
  }, [queryError, validationData, isValidLength, name, setError, clearErrors]);

  const isAvailable =
    validationData?.success && !queryError && !isCheckingUsername;
  const isTaken =
    !isCheckingUsername &&
    isValidLength &&
    (queryError || validationData?.success === false);

  return (
    <FormItem>
      <FormLabel>Username *</FormLabel>
      <FormControl>
        <div className="relative">
          <Input placeholder="Choose a username.." {...field} />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isCheckingUsername && (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            )}
            {isAvailable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <CheckCircle2 className="h-5 w-5 cursor-pointer text-green-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Username is available</TooltipContent>
              </Tooltip>
            )}
            {isTaken && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <XCircle className="h-5 w-5 cursor-pointer text-red-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {queryError?.message || "Username is not available"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export default UsernameField;
