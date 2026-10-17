import { scenarios, withScenario } from "@/mock/handlers";

/** MSW handler sets for each Dashboard page story. */
export const dashboardHandlers = {
  allQuarantined: withScenario(scenarios.inbox.allQuarantined),
  closedWithBlocks: withScenario(scenarios.settings.closedWithBlocks),
  default: withScenario(),
  emptyInbox: withScenario(scenarios.inbox.empty),
  inboxError: withScenario(scenarios.inbox.error),
  inboxLoading: withScenario(scenarios.inbox.loading),
  sessionLoading: withScenario(scenarios.session.loading),
  signedOut: withScenario(scenarios.session.unauthenticated),
};
