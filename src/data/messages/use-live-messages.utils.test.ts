import { describe, expect, it } from "vitest";
import { EMPTY_INBOX_COUNTS } from "@/lib/messages/inbox-filter";
import { buildMessage, sweetMessage } from "@/mock/fixtures/messages.fixtures";
import type { MessageDto } from "@/types/api";
import {
  addToInboxCounts,
  buildLiveMessageToast,
  HIDDEN_LIVE_TOAST_TITLE,
  insertLiveMessage,
  LIVE_TOAST_TITLE,
  toLiveMessageDto,
} from "./use-live-messages.utils";

const LONG_CONTENT =
  "This is a long anonymous message that goes well past forty characters.";

describe("buildLiveMessageToast", () => {
  it("stays silent for a quarantined message, whatever the settings", () => {
    expect(
      buildLiveMessageToast({ content: "rude", isQuarantined: true }, false)
    ).toBeNull();
    expect(
      buildLiveMessageToast({ content: "rude", isQuarantined: true }, true)
    ).toBeNull();
  });

  it("shows no text when the recipient hides message text", () => {
    expect(buildLiveMessageToast({ content: "hello there" }, true)).toEqual({
      title: HIDDEN_LIVE_TOAST_TITLE,
    });
  });

  it("previews short messages in full and truncates long ones", () => {
    expect(buildLiveMessageToast({ content: "hello there" }, false)).toEqual({
      description: "hello there",
      title: LIVE_TOAST_TITLE,
    });
    expect(
      buildLiveMessageToast({ content: LONG_CONTENT }, false)?.description
    ).toBe(`${LONG_CONTENT.slice(0, 40)}…`);
  });

  it("falls back to the neutral title when content is missing", () => {
    expect(buildLiveMessageToast({}, false)).toEqual({
      title: HIDDEN_LIVE_TOAST_TITLE,
    });
  });
});

describe("toLiveMessageDto", () => {
  it("maps a complete SSE payload and rejects partial ones", () => {
    expect(
      toLiveMessageDto({
        _id: "msg-live",
        content: "Hello there friend",
        createdAt: "2026-10-14T10:00:00.000Z",
        sentimentTag: "sweet",
      })
    ).toEqual({
      _id: "msg-live",
      content: "Hello there friend",
      createdAt: "2026-10-14T10:00:00.000Z",
      isArchived: false,
      isPinned: false,
      isQuarantined: false,
      isRead: false,
      reply: null,
      sentimentTag: "sweet",
    });
    expect(toLiveMessageDto({ content: "no id" })).toBeNull();
  });
});

describe("insertLiveMessage", () => {
  const live = buildMessage({ _id: "msg-live", isRead: false });
  const quarantined = buildMessage({ _id: "msg-live-q", isQuarantined: true });
  const pageOf = (messages: MessageDto[], total = messages.length) => ({
    pageParams: [undefined],
    pages: [{ messages, nextCursor: null, success: true, total }],
  });

  it("prepends to lists the message belongs to and bumps the total", () => {
    const next = insertLiveMessage(
      pageOf([sweetMessage]),
      { status: "all" },
      live
    );
    expect(next?.pages[0].messages.map((m) => m._id)).toEqual([
      "msg-live",
      sweetMessage._id,
    ]);
    expect(next?.pages[0].total).toBe(2);
  });

  it("leaves other filters, searches and duplicates alone", () => {
    const data = pageOf([sweetMessage]);
    expect(insertLiveMessage(data, { status: "all" }, quarantined)).toBe(data);
    expect(insertLiveMessage(data, { status: "starred" }, live)).toBe(data);
    expect(insertLiveMessage(data, { q: "hi", status: "all" }, live)).toBe(
      data
    );
    const withLive = pageOf([live]);
    expect(insertLiveMessage(withLive, { status: "all" }, live)).toBe(withLive);
    expect(
      insertLiveMessage(undefined, { status: "all" }, live)
    ).toBeUndefined();
  });

  it("puts quarantined messages only into Quarantined", () => {
    const next = insertLiveMessage(
      pageOf([]),
      { status: "quarantined" },
      quarantined
    );
    expect(next?.pages[0].messages).toEqual([quarantined]);
  });
});

describe("addToInboxCounts", () => {
  it("counts a clean unread message in all, unread and total", () => {
    expect(
      addToInboxCounts(EMPTY_INBOX_COUNTS, buildMessage({ isRead: false }))
    ).toEqual({ ...EMPTY_INBOX_COUNTS, all: 1, total: 1, unread: 1 });
  });

  it("counts a quarantined message only in quarantined and total", () => {
    expect(
      addToInboxCounts(
        EMPTY_INBOX_COUNTS,
        buildMessage({ isQuarantined: true })
      )
    ).toEqual({ ...EMPTY_INBOX_COUNTS, quarantined: 1, total: 1 });
  });
});
