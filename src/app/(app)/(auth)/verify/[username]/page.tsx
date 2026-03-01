import type { Metadata } from "next";
import type React from "react";
import { VerifyCodeForm } from "@/components/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <div className="flex items-center justify-center bg-background p-4">
      <Card className="mt-16 w-full max-w-lg">
        <CardHeader className="">
          <CardTitle className="font-bold text-xl md:text-2xl">
            Verify Your account!
          </CardTitle>
          <CardDescription>
            {`Hi ${username}, Please enter the one-time password sent to your email.`}
          </CardDescription>
        </CardHeader>
        <VerifyCodeForm username={username} />
      </Card>
    </div>
  );
};

export default VerifyUserPage;
