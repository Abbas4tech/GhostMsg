"use client";

import { Loader2 } from "lucide-react";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";
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
import type { messageSchema } from "@/schemas/message-schema";

export type SendMessageValues = z.infer<typeof messageSchema>;

export interface SendMessageFormProps {
  /** Form instance owned by the parent controller (validation + value state). */
  form: UseFormReturn<SendMessageValues>;
  isSubmitting?: boolean;
  onSubmit: (values: SendMessageValues) => void | Promise<void>;
  username: string;
}

export function SendMessageForm({
  form,
  isSubmitting = false,
  onSubmit,
  username,
}: SendMessageFormProps): React.JSX.Element {
  const isFormValid = form.formState.isValid;

  return (
    <Form {...form}>
      <form
        className="flex w-full max-w-2xl flex-col items-center gap-4 self-center"
        data-slot="send-message-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="mx-auto flex w-full flex-col">
              <FormLabel>{`Send your Anonymous Message to @${username}`}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="w-full"
                  placeholder="Type your message here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="w-32"
          disabled={!isFormValid || isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default SendMessageForm;
