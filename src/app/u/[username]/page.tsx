"use client";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw } from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

import { messageSchema } from "@/schemas/messageSchema";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ApiResponse } from "@/types/ApiResponse";
import ThemeSwitch from "@/components/ThemeSwitch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        content,
      });

      toast.success(response.data.message);
      form.reset();
    } catch (error) {
      const err = error as AxiosError<ApiResponse>;
      toast.error(err.response?.data.message);
    }
  };

  const suggestMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<ApiResponse>("/api/suggest-messages");
      const messages = (response.data.messages as unknown as string).split(
        "||"
      );
      setSuggestedMessages(messages);
    } catch (error) {
      console.error(error);
      const err = error as AxiosError<ApiResponse>;
      toast.error(err.response?.data.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    suggestMessages();
  }, [suggestMessages]);

  return (
    <div className="container mx-auto p-4 flex flex-col gap-12 relative">
      <ThemeSwitch className="absolute right-4 top-4" />
      <h2 className="scroll-m-20 capitalize text-center mt-8 text-2xl md:text-4xl font-extrabold tracking-tight text-balance">
        public profile link
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="w-full max-w-2xl flex flex-col self-center gap-4 items-center"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="w-full mx-auto flex flex-col">
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
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            className="w-32"
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
          size={"lg"}
          onClick={suggestMessages}
        >
          <RefreshCw className={cn(isLoading ? "animate-spin" : "")} />
          Suggest Messages
        </Button>

        {suggestedMessages.length > 0 && (
          <Card className="mx-auto">
            <CardContent className="flex flex-col gap-6">
              {suggestedMessages.map((m) => (
                <Button
                  variant={"outline"}
                  className=""
                  onClick={() =>
                    form.setValue("content", m, { shouldValidate: true })
                  }
                  key={`${Math.random()}`}
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
