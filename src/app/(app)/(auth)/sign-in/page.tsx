import React from "react";
import { Metadata } from "next";

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
  <main className="flex justify-center items-center p-4 bg-background">
    <section className="w-full mt-8 max-w-sm">
      <header className="text-center flex flex-col mb-6 gap-2">
        <h2 className="text-xl leading-none md:text-2xl font-bold">
          Login to your account
        </h2>
        <p className="text-muted-foreground text-sm">
          Continue your journey with GhostMsg
        </p>
      </header>
      <AuthForm mode="signin" />
    </section>
  </main>
);

export default SignInPage;
