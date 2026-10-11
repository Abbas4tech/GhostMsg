import type React from "react";
import { Hero } from "@/components/blocks/hero";
import { SiteLayout } from "@/components/pages/layouts/site-layout";
import { MessagesCarousel } from "@/components/patterns/messages-carousel";
import sampleMessages from "@/mock/messages.json";

/** Landing page: site header + hero with the sample-messages carousel. */
export function HomePage(): React.JSX.Element {
  return (
    <SiteLayout>
      <main className="container mx-auto my-6 flex w-full max-w-5xl flex-col px-4 md:my-12">
        <Hero
          description="GhostMsg lets you send anonymous messages that appear out of nowhere. Perfect for fun confessions, playful hints, or secret admirers."
          title="Send Messages like a Ghost. 👻"
        >
          <MessagesCarousel messages={sampleMessages} />
        </Hero>
      </main>
    </SiteLayout>
  );
}

export default HomePage;
