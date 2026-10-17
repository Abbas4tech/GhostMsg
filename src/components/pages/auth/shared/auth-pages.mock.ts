import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { scenarios, withScenario } from "@/mock/handlers";

export const authCredentials = {
  email: "johndoe@example.com",
  otp: "123456",
  password: "secret123",
  username: FIXTURE_USERNAME,
};

export const authPageHandlers = {
  default: withScenario(scenarios.session.unauthenticated),
  invalidCredentials: withScenario(
    // Most specific override first: MSW uses the first matching handler.
    scenarios.credentials.invalid,
    scenarios.session.unauthenticated
  ),
  signUpError: withScenario(
    scenarios.signUp.error,
    scenarios.session.unauthenticated
  ),
  usernameTaken: withScenario(
    scenarios.username.taken,
    scenarios.session.unauthenticated
  ),
  verifyInvalid: withScenario(
    scenarios.verify.invalid,
    scenarios.session.unauthenticated
  ),
};
