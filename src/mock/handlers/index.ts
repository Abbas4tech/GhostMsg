import type { HttpHandler } from "msw";
import { authHandlers } from "./auth.handlers";
import { messageHandlers } from "./messages.handlers";
import { publicHandlers } from "./public.handlers";
import { userHandlers } from "./user.handlers";

/**
 * Named MSW scenarios (ADR 0016, Q10). Prepend a scenario to `defaultHandlers`
 * to override it: MSW uses the first matching handler.
 *
 * @example parameters: { msw: { handlers: [...scenarios.inbox.empty, ...defaultHandlers] } }
 */
export const scenarios = {
  ai: publicHandlers.ai,
  answers: publicHandlers.answers,
  credentials: authHandlers.credentials,
  inbox: messageHandlers.inbox,
  send: publicHandlers.send,
  session: authHandlers.session,
  settings: userHandlers.settings,
  signUp: authHandlers.signUp,
  username: authHandlers.username,
  verify: authHandlers.verify,
};

/** A signed-in recipient with a mixed inbox, default settings and a public profile. */
export const defaultHandlers: HttpHandler[] = [
  ...scenarios.session.authenticated,
  ...scenarios.inbox.mixed,
  ...scenarios.settings.defaults,
  ...scenarios.answers.some,
  ...scenarios.ai.default,
  ...scenarios.send.success,
  ...scenarios.username.available,
  ...scenarios.signUp.success,
  ...scenarios.verify.success,
];

/** Combine a scenario override with the defaults (override wins). */
export const withScenario = (...overrides: HttpHandler[][]): HttpHandler[] => [
  ...overrides.flat(),
  ...defaultHandlers,
];
