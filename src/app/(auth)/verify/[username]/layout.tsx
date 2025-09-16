import { Metadata } from "next";
import React, { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Verify Account",
  description:
    "Complete your GhostMsg account verification to unlock full ghost messaging capabilities.",
  openGraph: {
    title: "Verify Account",
    description:
      "Confirm your ghost identity and start sending anonymous messages.",
  },
};

const layout = ({ children }: PropsWithChildren): React.ReactNode => children;

export default layout;
