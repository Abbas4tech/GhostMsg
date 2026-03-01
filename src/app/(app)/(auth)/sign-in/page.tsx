import type { Metadata } from "next";
import type React from "react";

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
  <main className="flex items-center justify-center bg-background p-4">
    <section className="mt-8 w-full max-w-sm">
      <header className="mb-6 flex flex-col gap-2">
        <Text as={"h2"} variant={"h2"}>
          Login to your account
        </Text>
        <Text variant={"muted"}>Continue your journey with GhostMsg</Text>
      </header>
      <AuthForm mode="signin" />
    </section>
  </main>
);

export default SignInPage;
