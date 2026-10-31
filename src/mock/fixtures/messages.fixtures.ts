import type { InboxCounts } from "@/lib/messages/inbox-filter";
import type { MessageDto, SmartReplyDraftDto } from "@/types/api";

/** Inbox message exactly as `GET /api/get-messages` returns it. */
export type MessageFixture = MessageDto;

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
    createdAt: fixtureDate(),
    isArchived: false,
    isPinned: false,
    isQuarantined: false,
    isRead: false,
    reply: null,
    senderHash: "hash-sender-1",
    sentimentTag: "sweet",
    ...overrides,
  };
}

export const sweetMessage = buildMessage();

export const curiousMessage = buildMessage({
  _id: "msg-2",
  content: "What's the best piece of advice you've ever received?",
  createdAt: fixtureDate(3),
  isRead: true,
  senderHash: "hash-sender-2",
  sentimentTag: "curious",
});

export const answeredSpicyMessage = buildMessage({
  _id: "msg-3",
  content: "What is your most controversial design opinion?",
  createdAt: fixtureDate(26),
  isPinned: true,
  isRead: true,
  reply: {
    isPublished: true,
    publishedAt: fixtureDate(25),
    text: "Minimalist interfaces always win over cluttered dashboards.",
  },
  senderHash: "hash-sender-3",
  sentimentTag: "spicy",
});

export const privateReplyAdviceMessage = buildMessage({
  _id: "msg-4",
  content: "Should I switch careers into design at 30?",
  createdAt: fixtureDate(48),
  isRead: true,
  reply: {
    isPublished: false,
    text: "It's never too late. Start with small projects.",
  },
  senderHash: "hash-sender-4",
  sentimentTag: "advice",
});

export const quarantinedMessage = buildMessage({
  _id: "msg-5",
  content: "Click this totally legit link to win a prize!!!",
  createdAt: fixtureDate(5),
  isQuarantined: true,
  quarantineReason: "spam",
  senderHash: "hash-spammer",
  sentimentTag: "neutral",
});

export const noSenderHashMessage = buildMessage({
  _id: "msg-6",
  content: "A message from before sender fingerprints existed.",
  createdAt: fixtureDate(400),
  senderHash: undefined,
  sentimentTag: "neutral",
});

export const longContentMessage = buildMessage({
  _id: "msg-7",
  content:
    "This is a deliberately long anonymous message that keeps going to check wrapping, line height and card growth in every layout. ".repeat(
      4
    ),
  createdAt: fixtureDate(8),
  senderHash: "hash-sender-7",
  sentimentTag: "curious",
});

/** Named inbox datasets reused by stories, MSW handlers and tests. */
/** Design Modals board: one Smart Reply draft per tone. */
export const smartReplyDrafts: SmartReplyDraftDto[] = [
  {
    text: "Honestly, sometimes. But it taught me what I want.",
    tone: "thoughtful",
  },
  { text: "Never. The hard days were the point.", tone: "witty" },
  { text: "Thank you for asking. It means a lot.", tone: "wholesome" },
];

export const messageScenarios = {
  allQuarantined: [
    quarantinedMessage,
    buildMessage({ ...quarantinedMessage, _id: "msg-q2", content: "Spam #2" }),
  ],
  empty: [] as MessageFixture[],
  longContent: [longContentMessage, sweetMessage],
  mixed: [
    sweetMessage,
    curiousMessage,
    answeredSpicyMessage,
    privateReplyAdviceMessage,
    quarantinedMessage,
    noSenderHashMessage,
  ],
  single: [sweetMessage],
} satisfies Record<string, MessageFixture[]>;

/** Expected `GET /api/messages/counts` for `messageScenarios.mixed`. */
export const mixedMessageCounts = {
  all: 5,
  answered: 2,
  archived: 0,
  quarantined: 1,
  starred: 1,
  total: messageScenarios.mixed.length,
  unread: 2,
} satisfies InboxCounts;
