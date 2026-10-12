import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  FIXTURE_AMA_PROMPT,
  FIXTURE_USERNAME,
  publicAnswerScenarios,
} from "@/mock/fixtures/public-profile.fixtures";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { renderHookWithProviders } from "@/test/test-utils";
import { usePublicAnswersController } from "./use-public-answers.controller";

describe("usePublicAnswersController", () => {
  it("loads the AMA prompt and published answers", async () => {
    const { result } = renderHookWithProviders(() =>
      usePublicAnswersController(FIXTURE_USERNAME)
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.amaPrompt).toBe(FIXTURE_AMA_PROMPT);
    expect(result.current.answers).toHaveLength(
      publicAnswerScenarios.some.length
    );
  });

  it("falls back to an empty feed when the profile fails to load", async () => {
    server.use(...scenarios.answers.error);
    const { result } = renderHookWithProviders(() =>
      usePublicAnswersController("ghost")
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.answers).toEqual([]);
    expect(result.current.amaPrompt).toBeUndefined();
  });
});
