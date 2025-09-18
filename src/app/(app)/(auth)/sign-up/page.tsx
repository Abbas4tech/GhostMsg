import React from "react";
import { Metadata } from "next";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Signup",
  description:
    "Sign up for GhostMsg to start sending anonymous messages. Become a ghost and send messages without revealing your identity.",
  openGraph: {
    title: "Signup",
    description:
      "Join GhostMsg to send anonymous messages that appear out of nowhere!",
  },
};

const SignupPage = (): React.JSX.Element => (
  <div className="flex justify-center items-center p-4 bg-background">
    <Card className="w-full mt-16 max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold">
          Join GhostMsg
        </CardTitle>
        <CardDescription>
          Enter your details below to signup for your account
        </CardDescription>
      </CardHeader>
      <AuthForm mode="signup" />
    </Card>
  </div>
);

export default SignupPage;
