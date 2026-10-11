import type { Metadata } from "next";
import type React from "react";

import { SignUpPage } from "@/components/pages/auth/sign-up";

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

const Signup = (): React.JSX.Element => <SignUpPage />;

export default Signup;
