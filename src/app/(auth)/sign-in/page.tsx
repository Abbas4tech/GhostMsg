"use client";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { signInSchema } from "@/schemas/signInSchema";

const SignInPage = (): React.JSX.Element => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
    mode: "onChange",
  });

  const submitSignupHandler: SubmitHandler<
    z.infer<typeof signInSchema>
  > = async (data) => {
    try {
      const response = await signIn("credentials", {
        redirect: false,
        ...data,
      });
      if (!response?.ok) {
        toast(response?.error);
      }
      router.replace("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className=" flex justify-center items-center p-4 bg-background">
      <Card className="w-full my-16 mx-auto max-w-lg">
        <CardHeader className="justify-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Login to Honest Feedback
          </CardTitle>
          <CardDescription>
            Enter your details below to Login to your account
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
                              placeholder="Enter your password.."
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
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                disabled={!form.formState.isValid}
                type="submit"
                className="w-full"
              >
                {"Login"}
              </Button>
              <Button variant={"link"} className="text-xs" type="button">
                <Link href={"/sign-up"}>Create an account!</Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default SignInPage;
