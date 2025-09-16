"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, User2 } from "lucide-react";

import { Button } from "./ui/button";
import ThemeSwitch from "./ThemeSwitch";

const Header = (): React.JSX.Element => {
  const { status } = useSession();

  return (
    <header className="md:h-20 w-full bg-accent flex justify-center items-center p-4">
      <section className="container flex items-center justify-between">
        <Button
          asChild
          variant={"link"}
          className="scroll-m-20 p-0 text-center text-xl hover:no-underline md:text-3xl font-extrabold tracking-tight text-balance"
        >
          <Link href={"/"}>Honest Feedback</Link>
        </Button>

        <nav className="flex items-center gap-2">
          {status === "authenticated" ? (
            <Button onClick={() => signOut()}>
              <LogOut />
              Logout
            </Button>
          ) : (
            <Link href={"/sign-up"}>
              <Button>
                <User2 />
                Sign Up
              </Button>
            </Link>
          )}
          <ThemeSwitch />
        </nav>
      </section>
    </header>
  );
};

export default Header;
