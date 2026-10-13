import type React from "react";
import { Text } from "@/components/elements/text";
import { cn } from "@/lib/utils";

export interface HeroProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Showcase content rendered under the copy (e.g. a carousel). */
  children?: React.ReactNode;
  description: React.ReactNode;
  title: React.ReactNode;
}

/** Landing hero: headline, lead paragraph and a showcase slot. */
export function Hero({
  title,
  description,
  children,
  className,
  ...props
}: HeroProps): React.JSX.Element {
  return (
    <section
      className={cn("flex w-full flex-col gap-6 md:gap-12", className)}
      data-slot="hero"
      {...props}
    >
      <Text as="h1" className="text-center" variant="h1">
        {title}
      </Text>

      <Text className="text-center" variant="lead">
        {description}
      </Text>

      {children}
    </section>
  );
}

export default Hero;
