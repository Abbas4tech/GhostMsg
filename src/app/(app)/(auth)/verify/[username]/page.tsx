import type { Metadata } from "next";
import type React from "react";
import { VerifyPage } from "@/components/pages/auth/verify";

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

const VerifyUserPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<React.JSX.Element> => {
  const { username } = await params;
  return <VerifyPage username={username} />;
};

export default VerifyUserPage;
