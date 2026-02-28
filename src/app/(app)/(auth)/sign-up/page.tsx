import type { Metadata } from "next";
import type React from "react";

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
  <main className="flex items-center justify-center bg-background p-4">
    <section className="mt-8 w-full max-w-sm">
      <header className="mb-6 flex flex-col gap-2">
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
