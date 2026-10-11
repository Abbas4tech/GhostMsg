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
        success: true,
        message: "Username is unique",
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
  success: [
    http.post(mswPath("/api/sign-up"), () =>
      created("/api/sign-up", "post", {
        success: true,
        message: "User registered successfully. Please verify your email.",
      })
    ),
  ],
  error: [
    http.post(mswPath("/api/sign-up"), () =>
      apiError(400, "Email is already registered")
    ),
  ],
};

export const verifyHandlers = {
  success: [
    http.post(mswPath("/api/verify-code"), () =>
      ok("/api/verify-code", "post", {
        success: true,
        message: "Account verified successfully",
      })
    ),
  ],
  invalid: [
    http.post(mswPath("/api/verify-code"), () =>
      apiError(400, "Incorrect verification code")
    ),
  ],
};

export const authHandlers = {
  session: {
    authenticated: sessionHandlers(sessionScenarios.authenticated),
    unauthenticated: sessionHandlers(sessionScenarios.unauthenticated),
    loading: sessionHandlers(sessionScenarios.authenticated, {
      latency: "infinite",
    }),
  },
  credentials: credentialsHandlers,
  username: usernameHandlers,
  signUp: signUpHandlers,
  verify: verifyHandlers,
};
