"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

import { Button } from "./ui/button";
import ThemeSwitch from "./ThemeSwitch";

const Header = (): React.JSX.Element => {
  const session = useSession();

  return (
    <header className="h-20 bg-primary-foreground flex justify-center items-center p-4">
      <section className="container flex items-center justify-between">
        <h2 className="text-2xl font-bold">Honest Feedback</h2>

        <nav className="flex items-center gap-2">
          {session.status === "authenticated" ? (
            <Button onClick={() => signOut()}>Logout</Button>
          ) : (
            <Link href={"/sign-in"}>
              <Button>Signin</Button>
            </Link>
          )}
          <ThemeSwitch />
        </nav>
      </section>
    </header>
  );
};

export default Header;
