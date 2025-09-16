import { Metadata } from "next";
import React, { PropsWithChildren } from "react";

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

const layout = ({ children }: PropsWithChildren): React.ReactNode => children;

export default layout;
