import { Metadata } from "next";
import React, { PropsWithChildren } from "react";

type PublicProfileLayoutProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PublicProfileLayoutProps): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `Send Anonymous Message to ${username}`,
    description: `Send an anonymous message to ${username} on GhostMsg. They'll never know who sent it!`,
    openGraph: {
      title: `Send Anonymous Message to ${username} | GhostMsg 👻`,
      description: `Send a secret message to ${username} without revealing your identity.`,
    },
  };
}

const layout = ({ children }: PropsWithChildren): React.ReactNode => children;

export default layout;
