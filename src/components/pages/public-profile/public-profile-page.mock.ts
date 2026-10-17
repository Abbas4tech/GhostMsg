import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { scenarios, withScenario } from "@/mock/handlers";
import type { PublicProfilePageProps } from "./public-profile-page";

export const defaultPublicProfilePageArgs: PublicProfilePageProps = {
  autoFetchSuggestions: true,
  username: FIXTURE_USERNAME,
};

export const publicProfileHandlers = {
  answersLoading: withScenario(scenarios.answers.loading),
  default: withScenario(),
  noAnswers: withScenario(scenarios.answers.none),
  notAccepting: withScenario(scenarios.send.notAccepting),
  paused: withScenario(scenarios.answers.paused),
  suggestionsError: withScenario(scenarios.ai.error),
  userNotFound: withScenario(scenarios.answers.error),
};
