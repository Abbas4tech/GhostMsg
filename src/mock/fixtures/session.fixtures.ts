import type { Session } from "next-auth";
import { FIXTURE_USERNAME } from "./public-profile.fixtures";

/** NextAuth session as returned by `GET /api/auth/session`. */
export function buildSession(
  overrides: Partial<Session["user"]> = {}
): Session {
  return {
    expires: "2099-01-01T00:00:00.000Z",
    user: {
      _id: "user-1",
      email: "johndoe@example.com",
      isVerified: true,
      name: FIXTURE_USERNAME,
      username: FIXTURE_USERNAME,
      ...overrides,
    },
  };
}

export const sessionScenarios = {
  authenticated: buildSession(),
  /** NextAuth returns an empty object when there is no session. */
  unauthenticated: null,
} as const;
