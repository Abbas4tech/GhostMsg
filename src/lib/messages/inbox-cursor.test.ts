import { describe, expect, it } from "vitest";
import {
  compareNewestFirst,
  decodeInboxCursor,
  encodeInboxCursor,
  isAfterCursor,
} from "./inbox-cursor";

const ID_A = "660c1d2e1b9d4c001f3e8a1a";
const ID_B = "660c1d2e1b9d4c001f3e8a1b";
const AT = "2026-10-06T12:00:00.000Z";

describe("encodeInboxCursor / decodeInboxCursor", () => {
  it("round-trips a message position", () => {
    const cursor = encodeInboxCursor({ _id: ID_A, createdAt: AT });
    expect(cursor).toBe(`${AT}_${ID_A}`);
    expect(decodeInboxCursor(cursor)).toEqual({
      createdAt: new Date(AT),
      id: ID_A,
    });
  });

  it("rejects missing and malformed cursors", () => {
    expect(decodeInboxCursor(undefined)).toBeNull();
    expect(decodeInboxCursor("")).toBeNull();
    expect(decodeInboxCursor("not-a-cursor")).toBeNull();
    expect(decodeInboxCursor(`not-a-date_${ID_A}`)).toBeNull();
    expect(decodeInboxCursor(`${AT}_`)).toBeNull();
    expect(decodeInboxCursor(`${AT}_bad id!`)).toBeNull();
  });
});

describe("compareNewestFirst", () => {
  it("sorts newer first, then larger id first", () => {
    const older = { _id: ID_B, createdAt: "2026-10-05T12:00:00.000Z" };
    const sameTimeA = { _id: ID_A, createdAt: AT };
    const sameTimeB = { _id: ID_B, createdAt: AT };
    expect(
      [older, sameTimeA, sameTimeB].sort(compareNewestFirst).map((m) => m._id)
    ).toEqual([ID_B, ID_A, ID_B]);
    expect([older, sameTimeA, sameTimeB].sort(compareNewestFirst)[0]).toBe(
      sameTimeB
    );
  });
});

describe("isAfterCursor", () => {
  it("is true only for messages on a later page", () => {
    const cursor = decodeInboxCursor(`${AT}_${ID_B}`);
    if (!cursor) {
      throw new Error("cursor should decode");
    }
    expect(isAfterCursor({ _id: ID_A, createdAt: AT }, cursor)).toBe(true);
    expect(
      isAfterCursor(
        { _id: ID_A, createdAt: "2026-10-01T00:00:00.000Z" },
        cursor
      )
    ).toBe(true);
    expect(isAfterCursor({ _id: ID_B, createdAt: AT }, cursor)).toBe(false);
    expect(
      isAfterCursor(
        { _id: ID_A, createdAt: "2026-10-07T00:00:00.000Z" },
        cursor
      )
    ).toBe(false);
  });
});
