import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { INBOX_STATUSES } from "@/lib/messages/inbox-filter";
import {
  buildInboxFilter,
  DEFAULT_INBOX_PAGE_SIZE,
  escapeRegExp,
  inboxCountsPipeline,
  MAX_INBOX_PAGE_SIZE,
  parsePageSize,
  searchFilter,
  statusFilter,
  toInboxCounts,
} from "./inbox-query";

const RECIPIENT = new Types.ObjectId("660c1d2e1b9d4c001f3e8a1a");

describe("statusFilter", () => {
  it("mirrors the shared inbox rules", () => {
    const notArchived = { isArchived: { $ne: true } };
    expect(statusFilter("all")).toEqual({
      ...notArchived,
      isQuarantined: false,
    });
    expect(statusFilter("unread")).toEqual({
      ...notArchived,
      isQuarantined: false,
      isRead: false,
    });
    expect(statusFilter("starred")).toEqual({ ...notArchived, isPinned: true });
    expect(statusFilter("quarantined")).toEqual({
      ...notArchived,
      isQuarantined: true,
    });
    expect(statusFilter("archived")).toEqual({ isArchived: true });
    expect(statusFilter("any")).toEqual({});
    expect(Object.keys(statusFilter("answered"))).toEqual([
      "isArchived",
      "reply.text",
    ]);
  });

  it("has a filter for every inbox status", () => {
    for (const status of INBOX_STATUSES) {
      expect(statusFilter(status)).toBeTypeOf("object");
    }
  });
});

describe("searchFilter", () => {
  it("is null for a blank query", () => {
    expect(searchFilter("   ")).toBeNull();
  });

  it("matches content or the answer as an escaped, case-insensitive literal", () => {
    expect(searchFilter(" a.b* ")).toEqual({
      $or: [
        { content: { $options: "i", $regex: "a\\.b\\*" } },
        { "reply.text": { $options: "i", $regex: "a\\.b\\*" } },
      ],
    });
  });

  it("escapes every regular-expression character", () => {
    expect(escapeRegExp("(.*)+?^$|[]{}\\")).toBe(
      "\\(\\.\\*\\)\\+\\?\\^\\$\\|\\[\\]\\{\\}\\\\"
    );
  });
});

describe("buildInboxFilter", () => {
  it("scopes to the recipient and combines search with the cursor", () => {
    const cursor = {
      createdAt: new Date("2026-10-06T12:00:00.000Z"),
      id: "660c1d2e1b9d4c001f3e8a1b",
    };
    const filter = buildInboxFilter(RECIPIENT, {
      cursor,
      q: "hi",
      status: "unread",
    });

    expect(filter).toMatchObject({
      isQuarantined: false,
      isRead: false,
      recipientId: RECIPIENT,
    });
    expect(filter.$and).toHaveLength(2);
  });

  it("adds no $and without search or cursor", () => {
    expect(buildInboxFilter(RECIPIENT, { status: "all" })).toEqual({
      isArchived: { $ne: true },
      isQuarantined: false,
      recipientId: RECIPIENT,
    });
  });
});

describe("parsePageSize", () => {
  it("defaults, caps and ignores junk", () => {
    expect(parsePageSize(null)).toBe(DEFAULT_INBOX_PAGE_SIZE);
    expect(parsePageSize("0")).toBe(DEFAULT_INBOX_PAGE_SIZE);
    expect(parsePageSize("abc")).toBe(DEFAULT_INBOX_PAGE_SIZE);
    expect(parsePageSize("12")).toBe(12);
    expect(parsePageSize("5000")).toBe(MAX_INBOX_PAGE_SIZE);
  });
});

describe("inbox counts", () => {
  it("groups one recipient's messages in a single pass", () => {
    const [match, group] = inboxCountsPipeline(RECIPIENT) as [
      unknown,
      { $group: Record<string, unknown> },
    ];
    expect(match).toEqual({ $match: { recipientId: RECIPIENT } });
    expect(Object.keys(group.$group).sort()).toEqual([
      "_id",
      "all",
      "answered",
      "archived",
      "quarantined",
      "starred",
      "total",
      "unread",
    ]);
  });

  it("maps an empty inbox (no row) to zeros", () => {
    expect(toInboxCounts(undefined)).toEqual({
      all: 0,
      answered: 0,
      archived: 0,
      quarantined: 0,
      starred: 0,
      total: 0,
      unread: 0,
    });
  });
});
