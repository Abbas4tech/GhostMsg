"use client";

import Autoplay from "embla-carousel-autoplay";
import type React from "react";
import { Card, CardContent, CardTitle } from "@/components/elements/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/elements/carousel";

export interface CarouselMessage {
  content: string;
  createdAt: string | Date;
  id: string | number;
}

export interface MessagesCarouselProps {
  autoplayDelay?: number;
  messages: CarouselMessage[];
}

const DEFAULT_AUTOPLAY_DELAY_MS = 4000;

const TIMESTAMP_FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
};

/** Auto-playing, looping carousel of sample messages. */
export function MessagesCarousel({
  messages,
  autoplayDelay = DEFAULT_AUTOPLAY_DELAY_MS,
}: MessagesCarouselProps): React.JSX.Element {
  return (
    <Carousel
      className="w-full cursor-grab"
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]}
    >
      <CarouselContent>
        {messages.map((item) => (
          <CarouselItem className="md:basis-1/2 lg:basis-1/3" key={item.id}>
            <Card className="h-full justify-between rounded-sm py-6 md:gap-0">
              <CardTitle className="px-6 pb-6 font-semibold text-base capitalize md:text-lg">
                {item.content}
              </CardTitle>
              <CardContent className="px-6">
                {new Date(item.createdAt).toLocaleString(
                  "en-In",
                  TIMESTAMP_FORMAT
                )}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export default MessagesCarousel;
