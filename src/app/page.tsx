"use client";
import React from "react";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import messages from "@/mock/messages.json";
import Header from "@/components/Header";

export default function Home(): React.JSX.Element {
  return (
    <>
      <Header />
      <main className="w-full container my-6 md:my-12 max-w-5xl px-4 mx-auto flex flex-col gap-6 md:gap-12">
        <h1 className="scroll-m-20 text-center text-3xl md:text-5xl font-extrabold tracking-tight text-balance">
          Send Messages like a Ghost. 👻
        </h1>

        <p className="text-lg md:text-2xl font-semibold text-center text-muted-foreground">
          GhostMsg lets you send anonymous messages that appear out of nowhere.
          Perfect for fun confessions, playful hints, or secret admirers.
        </p>

        <Carousel
          opts={{
            loop: true,
          }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
          className="w-full cursor-grab"
        >
          <CarouselContent>
            {messages.map((_, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="rounded-sm py-6 gap-0">
                    <CardTitle className="capitalize px-6 pb-6 text-base md:text-lg font-semibold">
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
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>
    </>
  );
}
