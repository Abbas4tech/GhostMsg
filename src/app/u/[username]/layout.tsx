import type { Metadata } from "next";
import type React from "react";
import type { PropsWithChildren } from "react";
import { getPublicProfile } from "@/server/users/public-profile";

interface PublicProfileLayoutProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PublicProfileLayoutProps): Promise<Metadata> {
  const username = decodeURIComponent((await params).username);
  // Same per-request cached lookup the page uses.
  const profile = await getPublicProfile(username);
  const name = profile?.displayName || username;
  const prompt =
    profile?.showAmaBanner === false ? undefined : profile?.amaPrompt;

  return {
    title: `Send Anonymous Message to ${name}`,
    description:
      prompt ??
      `Send an anonymous message to ${name} on GhostMsg. They'll never know who sent it!`,
    openGraph: {
      title: `Send Anonymous Message to ${name} | GhostMsg 👻`,
      description:
        prompt ??
        `Send a secret message to ${name} without revealing your identity.`,
    },
  };
}

const layout = ({ children }: PropsWithChildren): React.ReactNode => children;

export default layout;
