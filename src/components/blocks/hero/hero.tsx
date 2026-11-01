import { Sparkles } from "lucide-react";
import type React from "react";
import { Parallax } from "@/components/animate/parallax";
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

/**
 * Landing hero: eyebrow, headline, lead, call to action and a showcase.
 * Phones (design MobLanding): one column, 16px rhythm, showcase below.
 */
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
        "relative mx-auto grid w-full max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-center gap-9 px-gutter pt-5 pb-0 md:gap-12 md:pt-10 md:pb-14",
        className
      )}
      data-slot="hero"
      {...props}
    >
      {/* Decorative depth: sparkles drift faster than the page (Rich motion only). */}
      <Parallax
        aria-hidden="true"
        className="absolute top-2 left-[46%] max-sm:hidden"
        offset={90}
      >
        <Sparkles className="size-5 text-star motion-safe:animate-float" />
      </Parallax>
      <Parallax
        aria-hidden="true"
        className="absolute top-56 right-2 max-sm:hidden"
        offset={140}
      >
        <Sparkles className="size-4 text-primary motion-safe:animate-float motion-safe:[animation-delay:-2s]" />
      </Parallax>

      {/* Entrance is CSS so it plays from first paint, before hydration. The
          headline (LCP) never fades: only the pieces around it rise in. */}
      <div className="flex flex-col items-start gap-4 md:gap-6">
        <div className="motion-safe:animate-rise">{eyebrow}</div>
        <h1 className="text-balance text-display">{title}</h1>
        <p className="max-w-[520px] text-balance text-body-lg text-muted-foreground motion-safe:animate-rise motion-safe:[animation-delay:90ms]">
          {description}
        </p>
        {children ? (
          <div className="w-full motion-safe:animate-rise motion-safe:[animation-delay:180ms]">
            {children}
          </div>
        ) : null}
      </div>

      {showcase ? (
        // Parallax (transform via motion) wraps the CSS rise (transform via
        // keyframes) so the two never fight over the same element.
        <Parallax className="relative" offset={36}>
          <div className="motion-safe:animate-rise motion-safe:[animation-delay:260ms]">
            {showcase}
          </div>
        </Parallax>
      ) : null}
    </section>
  );
}
