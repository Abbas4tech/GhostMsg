"use client";
import React, { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDebounceValue } from "usehooks-ts";
import axios, { AxiosError } from "axios";
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { signInSchema } from "@/schemas/signInSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { signUpSchema } from "@/schemas/signUpSchema";

type AuthFormMode = "signin" | "signup";

interface AuthFormProps {
  mode: AuthFormMode;
  redirectPath?: string;
}

const AuthForm = ({
  mode,
  redirectPath = "/dashboard",
}: AuthFormProps): React.JSX.Element => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [validationResult, setValidationResult] = useState<ApiResponse | null>(
    null
  );

  const schema = mode === "signin" ? signInSchema : signUpSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: "",
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const usernameValue = form.watch("username");
  const [debouncedUsername, setDebouncedUsername] = useDebounceValue("", 500);

  useEffect(() => {
    if (mode === "signup") {
      form.clearErrors("username");
      setDebouncedUsername(usernameValue);
    }
  }, [usernameValue, setDebouncedUsername, form, mode]);

  useEffect(() => {
    const validateUsername = async (): Promise<void> => {
      if (
        mode !== "signup" ||
        !debouncedUsername ||
        debouncedUsername.length < 2
      ) {
        setValidationResult(null);
        return;
      }

      setIsCheckingUsername(true);
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
          message: err.response?.data.message || "Unknown error occurred!",
        });
        setValidationResult({
          success: false,
          message: err.response?.data.message || "Unknown error occurred!",
        });
      } finally {
        setIsCheckingUsername(false);
      }
    };

    validateUsername();
  }, [debouncedUsername, form, mode]);

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    try {
      if (mode === "signin") {
        const { identifier, password } = data as z.infer<typeof signInSchema>;
        const response = await signIn("credentials", {
          redirect: false,
          identifier,
          password,
        });

        if (!response?.ok) {
          toast.error(response?.error || "Login failed");
        } else {
          toast.success("Login successful");
          router.replace(redirectPath);
        }
      } else {
        const { email, password, username } = data as z.infer<
          typeof signUpSchema
        >;
        const res = await axios.post<ApiResponse>("/api/sign-up", {
          username,
          email,
          password,
        });

        if (res.data.success) {
          toast.success(res.data.message);
          router.replace(`/verify/${username}`);
        }
      }
    } catch (error) {
      if (mode === "signin") {
        toast.error("Login failed. Please check your credentials.");
      } else {
        const err = error as AxiosError<ApiResponse>;
        toast.error(err.response?.data.message || "Signup failed");
      }
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const isValid = form.formState.isValid;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-3 md:gap-6">
          {mode === "signin" ? (
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username/Email *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username/email.."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="Choose a username.." {...field} />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {isCheckingUsername && (
                              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            )}
                            {validationResult &&
                              !isCheckingUsername &&
                              (validationResult.success ? (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {validationResult.message}
                                  </TooltipContent>
                                </Tooltip>
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
                          type="email"
                          placeholder="Please choose your email.."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          mode === "signin"
                            ? "Enter your password.."
                            : "Please choose your password.."
                        }
                        {...field}
                      />
                      <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <footer className="flex items-center flex-col gap-2 md:gap-4">
          <Button
            disabled={
              !isValid ||
              isSubmitting ||
              (mode === "signup" && isCheckingUsername)
            }
            type="submit"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "signin" ? "Logging in..." : "Signing up..."}
              </>
            ) : mode === "signin" ? (
              "Login"
            ) : (
              "Sign up"
            )}
          </Button>

          <div className="after:border-border w-full relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground text-sm capitalize relative z-10 px-2">
              Or
            </span>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={() => signIn("google")}
            variant={"outline"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </Button>

          <Button variant={"link"} className="text-xs" type="button">
            {mode === "signin" ? (
              <Link href="/sign-up">Create an account!</Link>
            ) : (
              <Link href="/sign-in">Already a member? Try logging in!</Link>
            )}
          </Button>
        </footer>
      </form>
    </Form>
  );
};

export default AuthForm;
