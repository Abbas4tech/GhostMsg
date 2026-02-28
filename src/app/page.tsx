"use client";
import Autoplay from "embla-carousel-autoplay";
import type React from "react";
import Header from "@/components/global-header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Text } from "@/components/ui/text";
import messages from "@/mock/messages.json";

export default function Home(): React.JSX.Element {
  return (
    <>
      <Header />
      <main className="container mx-auto my-6 flex w-full max-w-5xl flex-col gap-6 px-4 md:my-12 md:gap-12">
        <Text as={"h1"} className="text-center" variant={"h1"}>
          Send Messages like a Ghost. 👻
        </Text>

        <Text className="text-center" variant={"lead"}>
          GhostMsg lets you send anonymous messages that appear out of nowhere.
          Perfect for fun confessions, playful hints, or secret admirers.
        </Text>

        <Carousel
          className="w-full cursor-grab"
          opts={{
            loop: true,
          }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
        >
          <CarouselContent>
            {messages.map((_, index) => (
              <CarouselItem
                className="md:basis-1/2 lg:basis-1/3"
                key={`${index}-${_.id}`}
              >
                <Card className="h-full justify-between rounded-sm py-6 md:gap-0">
                  <CardTitle className="px-6 pb-6 font-semibold text-base capitalize md:text-lg">
                    {_.content}
                  </CardTitle>
                  <CardContent className="px-6">
                    {new Date(_.createdAt).toLocaleString("en-In", {
                      timeZone: "Asia/Kolkata",
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>
    </>
  );
}
