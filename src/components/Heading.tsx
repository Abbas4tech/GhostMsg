"use client";
import { useSession } from "next-auth/react";
import React from "react";

const Heading = (): React.JSX.Element | null => {
  const { data: session } = useSession();
  return (
    session && (
      <h2 className="scroll-m-20 border-b pb-2 text-lg md:text-3xl font-semibold tracking-tight first:mt-0">
        Welcome {session.user.username}
      </h2>
    )
  );
};
export default Heading;
