import React from "react";
import { Metadata } from "next";

import { AuthForm } from "@/components/auth";
import { Text } from "@/components/ui/text";

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
  <main className="flex justify-center items-center p-4 bg-background">
    <section className="w-full mt-8 max-w-sm">
      <header className="flex flex-col mb-6 gap-2">
        <Text as={"h2"} variant={"h2"}>
          Login to your account
        </Text >
        <Text variant={"muted"}>
          Continue your journey with GhostMsg
        </Text>
      </header>
      <AuthForm mode="signin" />
    </section>
  </main>
);

export default SignInPage;
