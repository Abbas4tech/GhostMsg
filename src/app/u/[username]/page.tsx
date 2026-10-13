import type React from "react";
import { PublicProfilePage } from "@/components/pages/public-profile";

interface SendMessagePageProps {
  params: Promise<{ username: string }>;
}

const SendMessagePage = async ({
  params,
}: SendMessagePageProps): Promise<React.JSX.Element> => {
  const { username } = await params;
  return <PublicProfilePage username={decodeURIComponent(username)} />;
};

export default SendMessagePage;
