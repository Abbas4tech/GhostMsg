"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSendMessageMutation } from "@/hooks/mutations/use-send-message-mutation";
import { messageSchema } from "@/schemas/message-schema";

interface SendMessageFormProps {
  onMessageSent?: () => void;
  selectedContent?: string;
  username: string;
}

export const SendMessageForm = ({
  username,
  selectedContent,
  onMessageSent,
}: SendMessageFormProps): React.JSX.Element => {
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
    mode: "onChange",
  });

  const sendMutation = useSendMessageMutation();

  useEffect(() => {
    if (selectedContent) {
      form.setValue("content", selectedContent, { shouldValidate: true });
    }
  }, [selectedContent, form]);

  const onFormSubmit: SubmitHandler<z.infer<typeof messageSchema>> = async (
    data
  ) => {
    try {
      const response = await sendMutation.mutateAsync({
        username,
        content: data.content,
      });

      if (response?.success) {
        toast.success(response.message);
        form.reset({ content: "" });
        onMessageSent?.();
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to send message");
    }
  };

  const isSubmitting = sendMutation.isPending;
  const isFormValid = form.formState.isValid;

  return (
    <Form {...form}>
      <form
        className="flex w-full max-w-2xl flex-col items-center gap-4 self-center"
        onSubmit={form.handleSubmit(onFormSubmit)}
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="mx-auto flex w-full flex-col">
              <Label>{`Send your Anonymous Message to @${username}`}</Label>
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
              {"Sending..."}
            </>
          ) : (
            "Send"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SendMessageForm;
