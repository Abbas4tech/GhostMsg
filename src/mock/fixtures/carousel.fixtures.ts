import { fixtureDate } from "./messages.fixtures";

export interface CarouselMessageFixture {
  content: string;
  createdAt: string;
  id: string;
}

export const carouselScenarios = {
  default: [
    {
      id: "c-1",
      content: "You light up every room you walk into!",
      createdAt: fixtureDate(2),
    },
    {
      id: "c-2",
      content: "What's the best advice you've ever received?",
      createdAt: fixtureDate(20),
    },
    {
      id: "c-3",
      content: "Your playlist recommendations are elite.",
      createdAt: fixtureDate(44),
    },
    {
      id: "c-4",
      content: "Office mein kisi ko tumpe crush hai... samjhe? 😉",
      createdAt: fixtureDate(70),
    },
  ],
  single: [
    {
      id: "c-1",
      content: "Only one message so far!",
      createdAt: fixtureDate(1),
    },
  ],
} satisfies Record<string, CarouselMessageFixture[]>;
