import type { Metadata } from "next";
import type React from "react";
import { VerifyPage } from "@/components/pages/auth/verify";

export const metadata: Metadata = {
  description:
    "Complete your GhostMsg account verification to unlock full ghost messaging capabilities.",
  openGraph: {
    description:
      "Confirm your ghost identity and start sending anonymous messages.",
    title: "Verify Account",
  },
  title: "Verify Account",
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
