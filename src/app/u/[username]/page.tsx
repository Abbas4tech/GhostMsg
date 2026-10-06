"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { messageSchema } from "@/schemas/message-schema";

const SendMessagePage = (): React.JSX.Element => {
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { username } = useParams<{ username: string }>();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
    mode: "onChange",
  });

  const onFormSubmit: SubmitHandler<z.infer<typeof messageSchema>> = async (
    data
  ) => {
    const { content } = data;
    try {
      const { data: response, error } = await api.POST("/api/send-message", {
        body: {
          username,
          content,
        },
      });

      if (response?.success) {
        toast.success(response.message);
        form.reset();
      } else {
        toast.error(error?.message || "Failed to send message");
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to send message");
    }
  };

  const suggestMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: response, error } = await api.GET("/api/suggest-messages");
      if (response?.success) {
        const messages = (response.messages || "").split("||");
        setSuggestedMessages(messages);
      } else {
        toast.error(error?.message || "Failed to suggest messages");
      }
    } catch (error) {
      console.error(error);
      const err = error as Error;
      toast.error(err.message || "Failed to suggest messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    suggestMessages();
  }, [suggestMessages]);

  return (
    <div className="container relative mx-auto flex flex-col gap-12 px-4 py-12">
      <ThemeTogglerButton
        className="absolute top-4 right-4"
        modes={["dark", "light"]}
      />
      <Text as={"h1"} className="text-center capitalize" variant={"h1"}>
        public profile link
      </Text>

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
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                {"Sending..."}
              </>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </Form>

      <div className="mx-auto">
        <Button
          className="my-4"
          disabled={isLoading}
          onClick={suggestMessages}
          size={"lg"}
        >
          <RefreshCw className={cn(isLoading ? "animate-spin" : "")} />
          Suggest Messages
        </Button>

        {suggestedMessages.length > 0 && (
          <Card className="mx-auto">
            <CardContent className="flex flex-col gap-6">
              {suggestedMessages.map((m) => (
                <Button
                  className=""
                  key={`${Math.random()}`}
                  onClick={() =>
                    form.setValue("content", m, { shouldValidate: true })
                  }
                  variant={"outline"}
                >
                  {m}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SendMessagePage;
