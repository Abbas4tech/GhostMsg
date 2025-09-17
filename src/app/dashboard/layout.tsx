import React, { PropsWithChildren } from "react";
import { Metadata } from "next";

import Header from "@/components/Header";

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

const layout = ({ children }: PropsWithChildren): React.JSX.Element => (
  <>
    <Header />
    {children}
  </>
);

export default layout;
