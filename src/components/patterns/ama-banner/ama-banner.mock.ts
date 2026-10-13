import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
} from "@/mock/fixtures/public-profile.fixtures";
import type { AmaBannerProps } from "./ama-banner";

export const defaultAmaBannerArgs: AmaBannerProps = {
  username: FIXTURE_USERNAME,
  prompt: FIXTURE_AMA_PROMPT,
};

export const longAmaBannerArgs = {
  username: "a_really_long_username_20",
  prompt:
    "Ask me anything about tech, design, careers, the books I'm reading, or roast my portfolio — I can take it!",
} satisfies Partial<AmaBannerProps>;
