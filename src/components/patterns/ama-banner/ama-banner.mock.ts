import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
} from "@/mock/fixtures/public-profile.fixtures";
import type { AmaBannerProps } from "./ama-banner";

export const defaultAmaBannerArgs: AmaBannerProps = {
  eyebrow: `AMA · ${FIXTURE_USERNAME}`,
  prompt: FIXTURE_AMA_PROMPT,
  tone: "brand",
  size: "md",
};

export const longAmaBannerArgs = {
  prompt:
    "Ask me anything about tech, design, careers, the books I'm reading, or roast my portfolio — I can take it!",
} satisfies Partial<AmaBannerProps>;
