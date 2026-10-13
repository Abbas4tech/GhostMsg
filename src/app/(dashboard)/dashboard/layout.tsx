import type { Metadata } from "next";
import type React from "react";
import type { PropsWithChildren } from "react";
import { DashboardLayout } from "@/components/pages/dashboard";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s · Dashboard | GhostMsg 👻",
  },
  description:
    "Manage your anonymous messages, view your ghost profile, and control your settings on GhostMsg.",
  openGraph: {
    title: "Dashboard",
    description:
      "Your command center for sending and receiving anonymous messages.",
  },
};

const layout = ({ children }: PropsWithChildren): React.JSX.Element => (
  <DashboardLayout>{children}</DashboardLayout>
);

export default layout;
