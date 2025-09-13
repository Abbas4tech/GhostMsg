"use client";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDebounceValue } from "usehooks-ts";
import axios, { AxiosError } from "axios";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";

const SignupPage = (): React.JSX.Element => {
  const [isChecking, setIsChecking] = useState(false);
  const [validationResult, setValidationResult] = useState<ApiResponse | null>(
    null
  );

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const usernameValue = form.watch("username");
  const [debouncedUsername, setDebouncedUsername] = useDebounceValue("", 500);

  // Update debounced value when username changes
  useEffect(() => {
    setDebouncedUsername(usernameValue);
  }, [usernameValue, setDebouncedUsername]);

  const submitSignupHandler: SubmitHandler<z.infer<typeof signUpSchema>> = (
    data
  ) => {
    console.log(data);
  };

  useEffect(() => {
    const validateUsername = async (): Promise<void> => {
      if (!debouncedUsername || debouncedUsername.length < 2) {
        setValidationResult(null);
        return;
      }

      setIsChecking(true);
      try {
        const result = await axios.get<ApiResponse>(
          `/api/check-username-unique?username=${debouncedUsername}`
        );
        setValidationResult(result.data);

        if (!result.data.success) {
          form.setError("username", {
            type: "manual",
            message: result.data.message,
          });
        } else {
          form.clearErrors("username");
        }
      } catch (error) {
        const err = error as AxiosError<ApiResponse>;
        form.setError("username", {
          type: "manual",
          message: err.response?.data.message || "Unknown error occured!",
        });
        setValidationResult({
          success: false,
          message: err.response?.data.message || "Unknown error occured!",
        });
      } finally {
        setIsChecking(false);
      }
    };

    validateUsername();
  }, [debouncedUsername, form]);

  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="justify-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Join Honest Feedback
          </CardTitle>
          <CardDescription>
            Enter your details below to signup for your account
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(submitSignupHandler)}
          >
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Choose a username.."
                              {...field}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              {isChecking && (
                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                              )}
                              {validationResult &&
                                !isChecking &&
                                (validationResult.success ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Please choose your email.."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Please choose your password.."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                disabled={!form.formState.isValid || isChecking}
                type="submit"
                className="w-full"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
              <Button variant={"link"} className="text-xs" type="button">
                Already a member ? Trying logging in!
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default SignupPage;
