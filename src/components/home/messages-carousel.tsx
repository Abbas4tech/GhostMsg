"use client";

import Autoplay from "embla-carousel-autoplay";
import type React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import messages from "@/mock/messages.json";

export function MessagesCarousel(): React.JSX.Element {
  return (
    <Carousel
      className="w-full cursor-grab"
      opts={{
        loop: true,
      }}
      plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
    >
      <CarouselContent>
        {messages.map((item) => (
          <CarouselItem className="md:basis-1/2 lg:basis-1/3" key={item.id}>
            <Card className="h-full justify-between rounded-sm py-6 md:gap-0">
              <CardTitle className="px-6 pb-6 font-semibold text-base capitalize md:text-lg">
                {item.content}
              </CardTitle>
              <CardContent className="px-6">
                {new Date(item.createdAt).toLocaleString("en-In", {
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
  );
}
