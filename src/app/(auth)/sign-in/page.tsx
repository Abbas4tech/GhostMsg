import React from "react";
import { Metadata } from "next";

import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "SignIn",
  description:
    "Access your GhostMsg account to send and receive anonymous messages. Your ghost identity awaits!",
  openGraph: {
    title: "SignIn",
    description:
      "Access your ghost account and continue sending anonymous messages.",
  },
};

const SignInPage = (): React.JSX.Element => (
  <div className="flex justify-center items-center p-4 bg-background">
    <Card className="w-full mt-16 mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold">
          Login to your account
        </CardTitle>
        <CardDescription>Start your journey with GhostMsg</CardDescription>
      </CardHeader>
      <AuthForm mode="signin" />
    </Card>
  </div>
);

export default SignInPage;
