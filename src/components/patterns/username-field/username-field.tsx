"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type React from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/elements/form";
import { Input } from "@/components/elements/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/elements/tooltip";

export type UsernameAvailability = "idle" | "checking" | "available" | "taken";

export interface UsernameFieldProps<TFieldValues extends FieldValues> {
  /** Availability state computed by the page controller. */
  availability?: UsernameAvailability;
  /** Tooltip text shown when the username is taken. */
  availabilityMessage?: string;
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
}

function AvailabilityIndicator({
  availability,
  message,
}: {
  availability: UsernameAvailability;
  message?: string;
}): React.JSX.Element | null {
  if (availability === "checking") {
    return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
  }

  if (availability === "idle") {
    return null;
  }

  const isAvailable = availability === "available";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          {isAvailable ? (
            <CheckCircle2 className="h-5 w-5 cursor-pointer text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 cursor-pointer text-red-500" />
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {isAvailable
          ? "Username is available"
          : message || "Username is not available"}
      </TooltipContent>
    </Tooltip>
  );
}

/** Username input with a live availability indicator. Owns no queries. */
export function UsernameField<TFieldValues extends FieldValues>({
  control,
  name,
  availability = "idle",
  availabilityMessage,
}: UsernameFieldProps<TFieldValues>): React.JSX.Element {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username *</FormLabel>
          <div className="relative">
            <FormControl>
              <Input placeholder="Choose a username.." {...field} />
            </FormControl>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <AvailabilityIndicator
                availability={availability}
                message={availabilityMessage}
              />
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default UsernameField;
