"use client";

import { Loader2, Lock } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import {
  type ControllerRenderProps,
  type UseFormReturn,
  useWatch,
} from "react-hook-form";
import type z from "zod";
import { Button } from "@/components/elements/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/elements/form";
import { Textarea } from "@/components/elements/textarea";
import { cn } from "@/lib/utils";
import type { messageSchema } from "@/schemas/message-schema";

export type SendMessageValues = z.infer<typeof messageSchema>;

/** Mirrors `messageSchema` (10–300 characters). */
export const MESSAGE_MAX_LENGTH = 300;
const MESSAGE_WARN_AT = 260;

export interface SendMessageFormProps {
  /** Layout/surface for the form, e.g. the public page's card. */
  className?: string;
  /** Form instance owned by the parent controller (validation + value state). */
  form: UseFormReturn<SendMessageValues>;
  isSubmitting?: boolean;
  onSubmit: (values: SendMessageValues) => void | Promise<void>;
  /** Slot between the field and Send (Suggested Messages). */
  suggestions?: React.ReactNode;
  username: string;
}

/** Anonymous Message box with reassurance, character count and Send. */
export function SendMessageForm({
  className,
  form,
  isSubmitting = false,
  onSubmit,
  suggestions,
  username,
}: SendMessageFormProps): React.JSX.Element {
  const content = useWatch({ control: form.control, name: "content" }) ?? "";
  const isFormValid = form.formState.isValid;
  const renderContentField = useCallback(
    ({
      field,
    }: {
      field: ControllerRenderProps<SendMessageValues, "content">;
    }) => (
      <FormItem className="gap-2.5">
        <FormLabel className="text-title">Your Anonymous Message</FormLabel>
        <FormControl>
          <Textarea
            {...field}
            className="min-h-[124px] resize-none rounded-md bg-card text-body"
            maxLength={MESSAGE_MAX_LENGTH}
            placeholder="Write something honest…"
          />
        </FormControl>
        <div className="flex items-center justify-between gap-3 text-muted-foreground text-sm">
          <span className="flex items-center gap-1.5">
            <Lock aria-hidden="true" className="size-3.5" />
            {username} can&apos;t see who you are
          </span>
          <span
            className={cn(
              "tabular-nums",
              content.length >= MESSAGE_WARN_AT &&
                "font-semibold text-destructive"
            )}
          >
            {content.length} / {MESSAGE_MAX_LENGTH}
          </span>
        </div>
        <FormMessage />
      </FormItem>
    ),
    [username, content]
  );

  return (
    <Form {...form}>
      <form
        aria-label="Send an Anonymous Message"
        className={cn("flex w-full flex-col gap-3", className)}
        data-slot="send-message-form"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="content"
          render={renderContentField}
        />

        {suggestions}

        <Button
          className="w-full rounded-full"
          disabled={!isFormValid || isSubmitting}
          size="xl"
          type="submit"
          variant="brand"
        >
          {isSubmitting ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <Lock aria-hidden="true" />
          )}
          {isSubmitting ? "Sending..." : "Send anonymously"}
        </Button>
      </form>
    </Form>
  );
}
