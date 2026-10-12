import { act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FIXTURE_USERNAME,
  suggestionScenarios,
} from "@/mock/fixtures/public-profile.fixtures";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useSendMessageController } from "./use-send-message.controller";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const SUGGESTION = "What is your favorite book of all time?";

const renderController = (autoFetchSuggestions = false) =>
  renderHookWithProviders(() =>
    useSendMessageController({
      username: FIXTURE_USERNAME,
      autoFetchSuggestions,
    })
  );

describe("useSendMessageController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and parses AI suggestions once on mount", async () => {
    const requests = recordRequests();
    const { result } = renderController(true);

    await waitFor(() =>
      expect(result.current.suggestions).toEqual(suggestionScenarios.default)
    );
    expect(
      requests.filter((r) => r === "GET /api/suggest-messages")
    ).toHaveLength(1);
  });

  it("does not fetch suggestions when auto-fetch is off", () => {
    const requests = recordRequests();
    renderController(false);

    expect(requests).toEqual([]);
  });

  it("toasts when suggestions are unavailable", async () => {
    server.use(...scenarios.ai.error);
    const { result } = renderController();

    await act(() => result.current.fetchSuggestions());

    expect(toast.error).toHaveBeenCalledWith("AI suggestions are unavailable");
    expect(result.current.suggestions).toEqual([]);
  });

  it("writes a selected suggestion straight into form state", async () => {
    const { result } = renderController();

    await act(async () => {
      result.current.selectSuggestion(SUGGESTION);
      await result.current.form.trigger("content");
    });

    expect(result.current.form.getValues("content")).toBe(SUGGESTION);
    expect(result.current.form.formState.errors.content).toBeUndefined();
  });

  it("sends the message, toasts and resets the form", async () => {
    const { result } = renderController();

    act(() => result.current.selectSuggestion(SUGGESTION));
    await act(() => result.current.handleSubmit({ content: SUGGESTION }));

    expect(toast.success).toHaveBeenCalledWith("Message sent successfully");
    expect(result.current.form.getValues("content")).toBe("");
  });

  it("toasts the server error when the recipient is not accepting", async () => {
    server.use(...scenarios.send.notAccepting);
    const { result } = renderController();

    await act(() => result.current.handleSubmit({ content: SUGGESTION }));

    expect(toast.error).toHaveBeenCalledWith(
      "User is not accepting messages right now"
    );
  });
});
