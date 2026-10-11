import { carouselScenarios } from "@/mock/fixtures/carousel.fixtures";
import type { MessagesCarouselProps } from "./messages-carousel";

export const defaultMessagesCarouselArgs: MessagesCarouselProps = {
  messages: carouselScenarios.default,
  autoplayDelay: 4000,
};

export const singleMessagesCarouselArgs = {
  messages: carouselScenarios.single,
} satisfies Partial<MessagesCarouselProps>;
