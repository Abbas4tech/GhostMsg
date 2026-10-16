import { Ghost, Home } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/elements/button";
import { BrandMark } from "@/components/patterns/brand-mark";

export interface NotFoundPanelProps {
  homeHref?: string;
}

/** Full-screen 404: a floating ghost, a calm line and a way home. */
export function NotFoundPanel({
  homeHref = "/",
}: NotFoundPanelProps): React.JSX.Element {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-brand-mist px-4"
      data-slot="not-found-panel"
    >
      <BrandMark href={homeHref} />
      <section className="flex w-full max-w-[400px] flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="grid size-24 place-items-center rounded-t-[48px] rounded-b-[14px] bg-accent text-accent-foreground motion-safe:animate-float"
        >
          <Ghost className="size-11" />
        </span>
        <p className="font-bold font-display text-muted-foreground text-sm uppercase tracking-wider">
          404
        </p>
        <h1 className="text-h1">This page vanished like a ghost.</h1>
        <p className="text-muted-foreground">
          The link may be mistyped, or the page was removed.
        </p>
        <Button asChild className="w-full rounded-full" size="xl">
          <Link href={homeHref}>
            <Home aria-hidden="true" />
            Home
          </Link>
        </Button>
      </section>
    </div>
  );
}

export default NotFoundPanel;
