"use client";

import { Check, Link2, X } from "lucide-react";
import type React from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
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
import { cn } from "@/lib/utils";

export type UsernameAvailability = "idle" | "checking" | "available" | "taken";

const DEFAULT_LINK_PREFIX = "ghostmsg.app/u/";

export interface UsernameFieldProps<TFieldValues extends FieldValues> {
  /** Availability state computed by the page controller. */
  availability?: UsernameAvailability;
  /** Shown when the username is taken. */
  availabilityMessage?: string;
  control: Control<TFieldValues>;
  /** Host + path the username is appended to in the link preview. */
  linkPrefix?: string;
  name: FieldPath<TFieldValues>;
}

function AvailabilityStatus({
  availability,
}: {
  availability: UsernameAvailability;
}): React.JSX.Element | null {
  if (availability === "checking") {
    return (
      <InputGroupAddon align="inline-end" role="status">
        Checking…
      </InputGroupAddon>
    );
  }
  if (availability === "available") {
    return (
      <InputGroupAddon align="inline-end" className="text-success">
        <Check aria-label="Username is available" role="img" />
      </InputGroupAddon>
    );
  }
  if (availability === "taken") {
    return (
      <InputGroupAddon align="inline-end" className="text-destructive">
        <X aria-label="Username is taken" role="img" />
      </InputGroupAddon>
    );
  }
  return null;
}

/**
 * Username input with "@" prefix, live availability and a preview of the
 * Public Profile Link it creates. Owns no queries.
 */
export function UsernameField<TFieldValues extends FieldValues>({
  control,
  name,
  availability = "idle",
  availabilityMessage,
  linkPrefix = DEFAULT_LINK_PREFIX,
}: UsernameFieldProps<TFieldValues>): React.JSX.Element {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = String(field.value ?? "");
        const link = `${linkPrefix}${value || "yourname"}`;
        const isTaken = availability === "taken";
        const showPreview = !(fieldState.error || isTaken);

        return (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <InputGroup
              size="lg"
              tone={availability === "available" ? "success" : "default"}
            >
              <InputGroupAddon aria-hidden="true">@</InputGroupAddon>
              <FormControl>
                <InputGroupInput
                  aria-invalid={isTaken || undefined}
                  autoCapitalize="none"
                  autoComplete="username"
                  placeholder="yourname"
                  spellCheck={false}
                  {...field}
                />
              </FormControl>
              <AvailabilityStatus availability={availability} />
            </InputGroup>
            {showPreview ? (
              <p
                className={cn(
                  "flex items-center gap-1.5 text-sm",
                  availability === "available"
                    ? "text-success"
                    : "text-muted-foreground"
                )}
                data-slot="username-link-preview"
              >
                <Link2 aria-hidden="true" className="size-4 shrink-0" />
                <span className="min-w-0 break-all">
                  Your link:{" "}
                  <b className="font-semibold text-foreground">{link}</b>
                  {availability === "available" ? " is available" : null}
                </span>
              </p>
            ) : null}
            {isTaken && !fieldState.error ? (
              <p className="text-destructive text-sm" role="alert">
                {availabilityMessage || "Username is already taken"}
              </p>
            ) : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export default UsernameField;
