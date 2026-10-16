"use client";

import { ShieldCheck } from "lucide-react";
import type React from "react";
import { CtaBanner } from "@/components/blocks/cta-banner";
import { Hero } from "@/components/blocks/hero";
import { QaShowcase } from "@/components/blocks/qa-showcase";
import { SiteFooter } from "@/components/blocks/site-footer";
import { TrustSection } from "@/components/blocks/trust-section";
import { SiteLayout } from "@/components/pages/layouts/site-layout";
import { ClaimLinkForm } from "@/components/patterns/claim-link-form";
import { HowItWorks } from "@/components/patterns/how-it-works";
import { landingContent } from "@/content/landing";
import { useClaimLinkController } from "./use-claim-link.controller";

/** Landing: hero with claim form + the product loop, safety, Q&A, CTA. */
export function HomePage(): React.JSX.Element {
  const claim = useClaimLinkController();
  const { example } = landingContent;

  return (
    <SiteLayout>
      <main>
        <Hero
          description="Share one link. Get Anonymous Messages. Answer the good ones and post them as Story Cards."
          eyebrow={
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-sentiment-curious/30 bg-sentiment-curious-subtle px-3 font-semibold text-sentiment-curious text-sm">
              <ShieldCheck aria-hidden="true" className="size-4" />
              No account needed to send
            </span>
          }
          showcase={
            <HowItWorks
              answer={example.answer}
              message={example.message}
              profileLabel={example.profileLabel}
              sentiment={example.sentiment}
            />
          }
          title="Say the honest thing. Stay a ghost."
        >
          <ClaimLinkForm
            linkPrefix={claim.linkPrefix}
            onSubmit={claim.handleSubmit}
            onValueChange={claim.setUsername}
            value={claim.username}
          />
        </Hero>

        <TrustSection />

        <QaShowcase {...landingContent.showcase} />

        <CtaBanner
          actionHref="/sign-up"
          actionLabel="Get your link"
          title="Your friends have things to say. Give them a safe place to say it."
        />
      </main>
      <SiteFooter />
    </SiteLayout>
  );
}

export default HomePage;
