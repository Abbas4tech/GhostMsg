import type React from "react";
import { PublicProfilePage } from "@/components/pages/public-profile";
import { getPublicProfile } from "@/server/users/public-profile";

interface SendMessagePageProps {
  params: Promise<{ username: string }>;
}

/**
 * The profile is rendered on the server (fast first paint, crawlable, link
 * previews) and handed to the page as initial query data (Chapter 20).
 */
const SendMessagePage = async ({
  params,
}: SendMessagePageProps): Promise<React.JSX.Element> => {
  const username = decodeURIComponent((await params).username);
  const initialProfile = await getPublicProfile(username);
  return (
    <PublicProfilePage initialProfile={initialProfile} username={username} />
  );
};

export default SendMessagePage;
