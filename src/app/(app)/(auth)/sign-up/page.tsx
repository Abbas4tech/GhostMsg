import type { Metadata } from "next";
import type React from "react";

import { SignUpPage } from "@/components/pages/auth/sign-up";

export const metadata: Metadata = {
  description:
    "Sign up for GhostMsg to start sending anonymous messages. Become a ghost and send messages without revealing your identity.",
  openGraph: {
    description:
      "Join GhostMsg to send anonymous messages that appear out of nowhere!",
    title: "Signup",
  },
  title: "Signup",
};

interface SignupProps {
  searchParams: Promise<{ username?: string | string[] }>;
}

const Signup = async ({
  searchParams,
}: SignupProps): Promise<React.JSX.Element> => {
  const { username } = await searchParams;
  return (
    <SignUpPage
      initialUsername={typeof username === "string" ? username : undefined}
    />
  );
};

export default Signup;
