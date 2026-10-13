import type { components } from "@/generated/api-schema";

/** Inbox message exactly as `GET /api/get-messages` returns it. Assignable to the `Message` model. */
export type MessageFixture = components["schemas"]["MessageItem"];

const BASE_DATE = Date.parse("2026-10-09T10:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;

/** ISO timestamp `hoursAgo` hours before a fixed base date (stable across runs). */
export const fixtureDate = (hoursAgo = 0): string =>
  new Date(BASE_DATE - hoursAgo * HOUR_MS).toISOString();

/** Builds a fully-typed inbox message. Override any field. */
export function buildMessage(
  overrides: Partial<MessageFixture> = {}
): MessageFixture {
  return {
    _id: "msg-1",
    content: "I really love how thoughtful and kind you always are!",
    sentimentTag: "sweet",
    isQuarantined: false,
    isPinned: false,
    isRead: false,
    reply: null,
    senderHash: "hash-sender-1",
    createdAt: fixtureDate(),
    ...overrides,
  };
}

export const sweetMessage = buildMessage();

export const curiousMessage = buildMessage({
  _id: "msg-2",
  content: "What's the best piece of advice you've ever received?",
  sentimentTag: "curious",
  isRead: true,
  senderHash: "hash-sender-2",
  createdAt: fixtureDate(3),
});

export const answeredSpicyMessage = buildMessage({
  _id: "msg-3",
  content: "What is your most controversial design opinion?",
  sentimentTag: "spicy",
  isRead: true,
  isPinned: true,
  senderHash: "hash-sender-3",
  createdAt: fixtureDate(26),
  reply: {
    text: "Minimalist interfaces always win over cluttered dashboards.",
    isPublished: true,
    publishedAt: fixtureDate(25),
  },
});

export const privateReplyAdviceMessage = buildMessage({
  _id: "msg-4",
  content: "Should I switch careers into design at 30?",
  sentimentTag: "advice",
  isRead: true,
  senderHash: "hash-sender-4",
  createdAt: fixtureDate(48),
  reply: {
    text: "It's never too late. Start with small projects.",
    isPublished: false,
  },
});

export const quarantinedMessage = buildMessage({
  _id: "msg-5",
  content: "Click this totally legit link to win a prize!!!",
  sentimentTag: "neutral",
  isQuarantined: true,
  senderHash: "hash-spammer",
  createdAt: fixtureDate(5),
});

export const noSenderHashMessage = buildMessage({
  _id: "msg-6",
  content: "A message from before sender fingerprints existed.",
  sentimentTag: "neutral",
  senderHash: undefined,
  createdAt: fixtureDate(400),
});

export const longContentMessage = buildMessage({
  _id: "msg-7",
  content:
    "This is a deliberately long anonymous message that keeps going to check wrapping, line height and card growth in every layout. ".repeat(
      4
    ),
  sentimentTag: "curious",
  senderHash: "hash-sender-7",
  createdAt: fixtureDate(8),
});

/** Named inbox datasets reused by stories, MSW handlers and tests. */
export const messageScenarios = {
  mixed: [
    sweetMessage,
    curiousMessage,
    answeredSpicyMessage,
    privateReplyAdviceMessage,
    quarantinedMessage,
    noSenderHashMessage,
  ],
  empty: [] as MessageFixture[],
  allQuarantined: [
    quarantinedMessage,
    buildMessage({ ...quarantinedMessage, _id: "msg-q2", content: "Spam #2" }),
  ],
  longContent: [longContentMessage, sweetMessage],
  single: [sweetMessage],
} satisfies Record<string, MessageFixture[]>;

/** Filter counts matching `messageScenarios.mixed`. */
export const mixedMessageCounts = {
  all: 5,
  unread: 2,
  starred: 1,
  answered: 2,
  quarantined: 1,
};
