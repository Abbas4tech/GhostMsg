import React from "react";
import { Metadata } from "next";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VerifyCodeForm } from "@/components/auth";

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
    <div className="flex justify-center items-center p-4 bg-background">
      <Card className="max-w-lg w-full mt-16">
        <CardHeader className="">
          <CardTitle className="text-xl md:text-2xl font-bold">
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
