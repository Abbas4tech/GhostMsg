import type { Session } from "next-auth";
import { FIXTURE_USERNAME } from "./public-profile.fixtures";

/** NextAuth session as returned by `GET /api/auth/session`. */
export function buildSession(
  overrides: Partial<Session["user"]> = {}
): Session {
  return {
    user: {
      _id: "user-1",
      username: FIXTURE_USERNAME,
      email: "johndoe@example.com",
      name: FIXTURE_USERNAME,
      isVerified: true,
      isAcceptingMessage: true,
      ...overrides,
    },
    expires: "2099-01-01T00:00:00.000Z",
  };
}

export const sessionScenarios = {
  authenticated: buildSession(),
  /** NextAuth returns an empty object when there is no session. */
  unauthenticated: null,
} as const;
