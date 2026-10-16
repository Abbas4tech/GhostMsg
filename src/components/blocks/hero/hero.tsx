import { Sparkles } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

export interface HeroProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Call to action under the lead paragraph (e.g. ClaimLinkForm). */
  children?: React.ReactNode;
  description: React.ReactNode;
  /** Small pill above the headline. */
  eyebrow?: React.ReactNode;
  /** Right-hand illustration (e.g. HowItWorks). */
  showcase?: React.ReactNode;
  title: React.ReactNode;
}

/** Landing hero: eyebrow, headline, lead, call to action and a showcase. */
export function Hero({
  eyebrow,
  title,
  description,
  children,
  showcase,
  className,
  ...props
}: HeroProps): React.JSX.Element {
  return (
    <section
      className={cn(
        "relative mx-auto grid w-full max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-center gap-12 px-gutter pt-6 pb-14 md:pt-10",
        className
      )}
      data-slot="hero"
      {...props}
    >
      <Sparkles
        aria-hidden="true"
        className="absolute top-2 left-[46%] size-5 text-star motion-safe:animate-float"
      />
      <Sparkles
        aria-hidden="true"
        className="absolute top-56 right-2 size-4 text-primary motion-safe:animate-float motion-safe:[animation-delay:-2s]"
      />

      <div className="flex flex-col items-start gap-6">
        {eyebrow}
        <h1 className="text-balance text-display">{title}</h1>
        <p className="max-w-[520px] text-balance text-body-lg text-muted-foreground">
          {description}
        </p>
        {children}
      </div>

      {showcase ? <div className="relative">{showcase}</div> : null}
    </section>
  );
}

export default Hero;
