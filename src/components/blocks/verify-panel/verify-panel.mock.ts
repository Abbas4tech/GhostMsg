import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import type { VerifyPanelProps } from "./verify-panel";

export const defaultVerifyPanelArgs: Omit<VerifyPanelProps, "children"> = {
  username: FIXTURE_USERNAME,
};
