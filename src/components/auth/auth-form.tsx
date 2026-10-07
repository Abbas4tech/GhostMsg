"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type React from "react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import type * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignUpMutation } from "@/hooks/mutations/use-sign-up-mutation";
import { signInSchema } from "@/schemas/sign-in-schema";
import { signUpSchema } from "@/schemas/sign-up-schema";
import { Button } from "../animate-ui/components/buttons/button";
import { UsernameField } from "./username-field";

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

  const signUpMutation = useSignUpMutation();

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

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    try {
      if (mode === "signin") {
        const { identifier, password } = data as z.infer<typeof signInSchema>;
        const response = await signIn("credentials", {
          redirect: false,
          identifier,
          password,
        });

        if (response?.ok) {
          toast.success("Login successful");
          router.replace(redirectPath);
        } else {
          toast.error(response?.error || "Login failed");
        }
      } else {
        const { email, password, username } = data as z.infer<
          typeof signUpSchema
        >;
        const res = await signUpMutation.mutateAsync({
          username,
          email,
          password,
        });

        if (res?.success) {
          toast.success(res.message);
          router.replace(`/verify/${username}`);
        }
      }
    } catch (error) {
      if (mode === "signin") {
        toast.error("Login failed. Please check your credentials.");
      } else {
        const err = error as Error;
        toast.error(err.message || "Signup failed");
      }
    }
  };

  const isSubmitting = form.formState.isSubmitting || signUpMutation.isPending;
  const isValid = form.formState.isValid;

  const renderSubmitButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === "signin" ? "Logging in..." : "Signing up..."}
        </>
      );
    }
    return mode === "signin" ? "Login" : "Sign up";
  };

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
                <UsernameField
                  clearErrors={form.clearErrors}
                  control={form.control}
                  name="username"
                  onCheckingChange={setIsCheckingUsername}
                  setError={form.setError}
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
                          type="email"
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
                        placeholder={
                          mode === "signin"
                            ? "Enter your password.."
                            : "Please choose your password.."
                        }
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                      <button
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        {showPassword ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <footer className="flex flex-col items-center gap-2 md:gap-4">
          <Button
            className="w-full"
            disabled={
              !isValid ||
              isSubmitting ||
              (mode === "signup" && isCheckingUsername)
            }
            type="submit"
          >
            {renderSubmitButtonContent()}
          </Button>

          <div className="relative w-full text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
            <span className="relative z-10 bg-background px-2 text-muted-foreground text-sm capitalize">
              Or
            </span>
          </div>

          <Button
            className="w-full"
            onClick={() => signIn("google")}
            type="button"
            variant={"outline"}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </Button>

          <Button className="text-xs" type="button" variant={"link"}>
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
