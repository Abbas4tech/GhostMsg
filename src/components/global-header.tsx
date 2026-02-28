"use client";
import { GhostIcon, LogOut, User2 } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import type React from "react";
import { Button } from "./animate-ui/components/buttons/button";
import { ThemeTogglerButton } from "./animate-ui/components/buttons/theme-toggler";

const Header = (): React.JSX.Element => {
  const { status } = useSession();

  return (
    <header className="flex w-full items-center justify-center bg-primary-foreground p-4 md:h-20">
      <section className="container flex items-center justify-between">
        <Button
          asChild
          className="!pl-0 scroll-m-20 text-balance text-center font-extrabold text-xl tracking-tight hover:no-underline md:text-3xl"
          variant={"link"}
        >
          <Link href={"/"}>
            <GhostIcon className="size-7 font-bold" /> GhostMsg{" "}
          </Link>
        </Button>

        <nav className="flex items-center gap-2">
          {status === "authenticated" ? (
            <Button onClick={() => signOut()}>
              <LogOut />
              Logout
            </Button>
          ) : (
            <Button asChild>
              <Link href={"/sign-up"}>
                <User2 />
                Sign Up
              </Link>
            </Button>
          )}
          <ThemeTogglerButton modes={["dark", "light"]} />
        </nav>
      </section>
    </header>
  );
};

export default Header;
