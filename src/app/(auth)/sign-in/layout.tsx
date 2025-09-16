import { Metadata } from "next";
import React, { PropsWithChildren } from "react";

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

const layout = ({ children }: PropsWithChildren): React.ReactNode => children;

export default layout;
