"use client";

import { CheckIcon, XIcon } from "lucide-react";
import type React from "react";
import { useCallback, useId } from "react";
import { Button } from "@/components/elements/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/elements/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/elements/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/elements/input-group";
import { Spinner } from "@/components/elements/spinner";
import type { UsernameAvailability } from "@/components/patterns/username-field";

export interface ChangeUsernameModalProps {
  availability: UsernameAvailability;
  /** Shown when taken or invalid. */
  errorMessage?: string;
  isSaving?: boolean;
  linkPrefix: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onValueChange: (value: string) => void;
  open: boolean;
  value: string;
}

/** Pick a new username; warns that the old link stops working. */
export function ChangeUsernameModal({
  open,
  onOpenChange,
  value,
  onValueChange,
  availability,
  errorMessage,
  linkPrefix,
  isSaving = false,
  onSubmit,
}: ChangeUsernameModalProps): React.JSX.Element {
  const inputId = useId();
  const isInvalid = availability === "taken" || Boolean(errorMessage);
  const canSave = availability === "available" && !isSaving;
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (canSave) {
        onSubmit();
      }
    },
    [canSave, onSubmit]
  );
  const handleValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(event.target.value);
    },
    [onValueChange]
  );
  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={handleSubmit}
        >
          <DialogHeader>
            <DialogTitle>Change your username</DialogTitle>
            <DialogDescription>
              Your link changes with it. The old link stops working, so update
              your bio afterwards.
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={isInvalid || undefined}>
            <FieldLabel htmlFor={inputId}>New username</FieldLabel>
            <InputGroup size="lg">
              <InputGroupAddon>
                <InputGroupText>{linkPrefix}</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                aria-invalid={isInvalid || undefined}
                autoCapitalize="none"
                autoComplete="off"
                className="pl-0"
                id={inputId}
                onChange={handleValueChange}
                spellCheck={false}
                value={value}
              />
              <InputGroupAddon align="inline-end">
                {availability === "checking" ? (
                  <Spinner aria-label="Checking" />
                ) : null}
                {availability === "available" ? (
                  <CheckIcon
                    aria-label="Username is available"
                    className="text-success"
                    role="img"
                  />
                ) : null}
                {availability === "taken" ? (
                  <XIcon
                    aria-label="Username is taken"
                    className="text-destructive"
                    role="img"
                  />
                ) : null}
              </InputGroupAddon>
            </InputGroup>
            {isInvalid ? (
              <FieldError>
                {errorMessage || "Username is already taken"}
              </FieldError>
            ) : (
              <FieldDescription>
                2–20 letters, numbers or underscores.
              </FieldDescription>
            )}
          </Field>
          <DialogFooter>
            <Button
              className="rounded-full"
              onClick={handleCancel}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button className="rounded-full" disabled={!canSave} type="submit">
              {isSaving ? <Spinner data-icon="inline-start" /> : null}
              Change username
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
