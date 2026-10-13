import { setupServer } from "msw/node";
import { defaultHandlers } from "@/mock/handlers";

/**
 * Node MSW server for the unit project (ADR 0016, Q11). Shares handlers with
 * Storybook. Override per test with `server.use(...scenarios.inbox.empty)`.
 */
export const server = setupServer(...defaultHandlers);
