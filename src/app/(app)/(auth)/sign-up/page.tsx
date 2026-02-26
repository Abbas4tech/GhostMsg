import React from "react";
import { Metadata } from "next";

import { AuthForm } from "@/components/auth";
import { Text } from "@/components/ui/text";

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
  <main className="flex justify-center items-center p-4 bg-background">
    <section className="w-full mt-8 max-w-sm">
      <header className="flex flex-col mb-6 gap-2">
        <Text as={"h2"} variant={"h2"}>
          Join GhostMsg
        </Text>
        <Text variant={"muted"}>
          Enter your details below to signup for your account
        </Text>
      </header>
      <AuthForm mode="signup" />
    </section>
  </main>
);

export default SignupPage;
