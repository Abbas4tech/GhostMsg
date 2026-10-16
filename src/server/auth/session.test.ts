import { getServerSession } from "next-auth";
import { describe, expect, it, vi } from "vitest";
import { getSessionUserId, unauthorizedResponse } from "./session";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

describe("getSessionUserId", () => {
  it("is null when there is no session", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    expect(await getSessionUserId()).toBeNull();
  });

  it("is null when the session has no user id", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: {},
    } as never);

    expect(await getSessionUserId()).toBeNull();
  });

  it("returns the session user's id as a string", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { _id: "507f1f77bcf86cd799439011" },
    } as never);

    expect(await getSessionUserId()).toBe("507f1f77bcf86cd799439011");
  });
});

describe("unauthorizedResponse", () => {
  it("answers 401 with the standard JSON envelope", async () => {
    const response = unauthorizedResponse();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: "Not authenticated",
    });
  });
});
