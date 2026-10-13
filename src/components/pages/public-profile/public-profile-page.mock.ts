import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { scenarios, withScenario } from "@/mock/handlers";
import type { PublicProfilePageProps } from "./public-profile-page";

export const defaultPublicProfilePageArgs: PublicProfilePageProps = {
  username: FIXTURE_USERNAME,
  autoFetchSuggestions: true,
};

export const publicProfileHandlers = {
  default: withScenario(),
  noAnswers: withScenario(scenarios.answers.none),
  answersLoading: withScenario(scenarios.answers.loading),
  userNotFound: withScenario(scenarios.answers.error),
  suggestionsError: withScenario(scenarios.ai.error),
  notAccepting: withScenario(scenarios.send.notAccepting),
};
