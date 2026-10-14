import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import type React from "react";
import type { PropsWithChildren } from "react";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { DashboardLayout } from "@/components/pages/dashboard";
import AuthProvider from "@/providers/auth-provider";

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

/**
 * The session is read on the server and handed to the client, so the
 * dashboard renders signed-in at once instead of flashing a skeleton while
 * `useSession` fetches it (Chapter 20).
 */
const layout = async ({
  children,
}: PropsWithChildren): Promise<React.JSX.Element> => {
  const session = await getServerSession(authOptions);
  return (
    <AuthProvider session={session}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
};

export default layout;
