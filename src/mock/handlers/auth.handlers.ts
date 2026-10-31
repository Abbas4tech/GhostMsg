import { HttpResponse, http } from "msw";
import type { Session } from "next-auth";
import { sessionScenarios } from "@/mock/fixtures/session.fixtures";
import {
  apiError,
  applyLatency,
  created,
  mswPath,
  ok,
  type ScenarioOptions,
} from "./utils";

const NEXT_AUTH_BASE = "/api/auth";

/** NextAuth client endpoints used by `useSession`, `signIn` and `signOut`. */
export const sessionHandlers = (
  session: Session | null,
  options: ScenarioOptions = {}
) => [
  http.get(`${NEXT_AUTH_BASE}/session`, async () => {
    await applyLatency(options);
    return HttpResponse.json(session ?? {});
  }),
  http.get(`${NEXT_AUTH_BASE}/csrf`, () =>
    HttpResponse.json({ csrfToken: "storybook-csrf-token" })
  ),
  http.get(`${NEXT_AUTH_BASE}/providers`, () =>
    HttpResponse.json({
      credentials: {
        id: "credentials",
        name: "Credentials",
        type: "credentials",
      },
      google: { id: "google", name: "Google", type: "oauth" },
    })
  ),
  // NextAuth's client parses `url` with `new URL()`, so it must be absolute.
  http.post(`${NEXT_AUTH_BASE}/signout`, ({ request }) =>
    HttpResponse.json({ url: new URL("/", request.url).href })
  ),
  http.post(`${NEXT_AUTH_BASE}/callback/credentials`, ({ request }) =>
    HttpResponse.json({ url: new URL("/dashboard", request.url).href })
  ),
  http.post(
    `${NEXT_AUTH_BASE}/_log`,
    () => new HttpResponse(null, { status: 204 })
  ),
];

/** NextAuth credentials sign-in rejected (wrong username/password). */
export const credentialsHandlers = {
  invalid: [
    http.post(`${NEXT_AUTH_BASE}/callback/credentials`, ({ request }) =>
      HttpResponse.json(
        {
          url: new URL("/api/auth/error?error=CredentialsSignin", request.url)
            .href,
        },
        { status: 401 }
      )
    ),
  ],
};

export const usernameHandlers = {
  available: [
    http.get(mswPath("/api/check-username-unique"), () =>
      ok("/api/check-username-unique", "get", {
        message: "Username is unique",
        success: true,
      })
    ),
  ],
  taken: [
    http.get(mswPath("/api/check-username-unique"), () =>
      apiError(400, "Username is already taken")
    ),
  ],
};

export const signUpHandlers = {
  error: [
    http.post(mswPath("/api/sign-up"), () =>
      apiError(400, "Email is already registered")
    ),
  ],
  success: [
    http.post(mswPath("/api/sign-up"), () =>
      created("/api/sign-up", "post", {
        message: "User registered successfully. Please verify your email.",
        success: true,
      })
    ),
  ],
};

export const verifyHandlers = {
  /** 400: the code is past its hour. */
  expired: [
    http.post(mswPath("/api/verify-code"), () =>
      HttpResponse.json(
        {
          message: "That code has expired. Get a new one.",
          reason: "expired",
          success: false,
        },
        { status: 400 }
      )
    ),
  ],
  /** A wrong code: the API answers 200 with the tries left. */
  invalid: [
    http.post(mswPath("/api/verify-code"), () =>
      ok("/api/verify-code", "post", {
        attemptsLeft: 2,
        message: "That code isn't right.",
        reason: "wrong",
        success: false,
      })
    ),
  ],
  /** 429: no tries left for this code. */
  locked: [
    http.post(mswPath("/api/verify-code"), () =>
      HttpResponse.json(
        {
          attemptsLeft: 0,
          message: "Too many tries. Get a new code.",
          reason: "locked",
          success: false,
        },
        { status: 429 }
      )
    ),
  ],
  success: [
    http.post(mswPath("/api/verify-code"), () =>
      ok("/api/verify-code", "post", {
        message: "Account verified successfully",
        success: true,
      })
    ),
  ],
};

export const resendCodeHandlers = {
  /** 429 inside the one-minute cooldown. */
  cooldown: [
    http.post(mswPath("/api/verify-code/resend"), () =>
      HttpResponse.json(
        {
          message: "You can get a new code in 42 seconds.",
          retryAfterSeconds: 42,
          success: false,
        },
        { status: 429 }
      )
    ),
  ],
  success: [
    http.post(mswPath("/api/verify-code/resend"), () =>
      ok("/api/verify-code/resend", "post", {
        message: "We sent you a new code.",
        retryAfterSeconds: 60,
        success: true,
      })
    ),
  ],
};

export const authHandlers = {
  credentials: credentialsHandlers,
  resendCode: resendCodeHandlers,
  session: {
    authenticated: sessionHandlers(sessionScenarios.authenticated),
    loading: sessionHandlers(sessionScenarios.authenticated, {
      latency: "infinite",
    }),
    unauthenticated: sessionHandlers(sessionScenarios.unauthenticated),
  },
  signUp: signUpHandlers,
  username: usernameHandlers,
  verify: verifyHandlers,
};
