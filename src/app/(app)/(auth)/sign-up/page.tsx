import React from "react";
import { Metadata } from "next";

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
  <main className="flex justify-center items-center p-4 bg-background">
    <section className="w-full mt-8 max-w-sm">
      <header className="text-center flex flex-col mb-6 gap-2">
        <h2 className="text-xl leading-none md:text-2xl font-bold">
          Join GhostMsg
        </h2>
        <p className="text-muted-foreground text-sm">
          Enter your details below to signup for your account
        </p>
      </header>
      <AuthForm mode="signup" />
    </section>
  </main>
);

export default SignupPage;
