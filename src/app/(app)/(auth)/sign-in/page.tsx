import type { Metadata } from "next";
import type React from "react";

import { SignInPage } from "@/components/pages/auth/sign-in";

export const metadata: Metadata = {
  description:
    "Access your GhostMsg account to send and receive anonymous messages. Your ghost identity awaits!",
  openGraph: {
    description:
      "Access your ghost account and continue sending anonymous messages.",
    title: "SignIn",
  },
  title: "SignIn",
};

const SignIn = (): React.JSX.Element => <SignInPage />;

export default SignIn;
