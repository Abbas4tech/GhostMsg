import React, { PropsWithChildren } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your anonymous messages, view your ghost profile, and control your settings on GhostMsg.",
  openGraph: {
    title: "Dashboard",
    description:
      "Your command center for sending and receiving anonymous messages.",
  },
};

const layout = ({ children }: PropsWithChildren): React.ReactNode => children;

export default layout;
