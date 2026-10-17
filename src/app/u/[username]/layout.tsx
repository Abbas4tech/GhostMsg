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
    description:
      prompt ??
      `Send an anonymous message to ${name} on GhostMsg. They'll never know who sent it!`,
    openGraph: {
      description:
        prompt ??
        `Send a secret message to ${name} without revealing your identity.`,
      title: `Send Anonymous Message to ${name} | GhostMsg 👻`,
    },
    title: `Send Anonymous Message to ${name}`,
  };
}

const layout = ({ children }: PropsWithChildren): React.ReactNode => children;

export default layout;
