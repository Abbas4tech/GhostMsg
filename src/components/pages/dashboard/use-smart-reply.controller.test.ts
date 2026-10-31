import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  answeredSpicyMessage,
  smartReplyDrafts,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useSmartReplyController } from "./use-smart-reply.controller";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
// `notify` (the design's toast API) forwards to the mocked Sonner spies above.
vi.mock("@/components/elements/sonner", async () => {
  const sonner = await import("sonner");
  return { notify: sonner.toast };
});

describe("useSmartReplyController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("seeds the draft from the message's existing reply when opened", () => {
    const { result } = renderHookWithProviders(() =>
      useSmartReplyController({
        isOpen: true,
        message: answeredSpicyMessage,
        onSaved: vi.fn(),
      })
    );

    expect(result.current.replyText).toBe(answeredSpicyMessage.reply?.text);
    expect(result.current.isPublished).toBe(
      answeredSpicyMessage.reply?.isPublished
    );
  });

  it("loads the three Smart Reply drafts in one request when opened", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() =>
      useSmartReplyController({
        isOpen: true,
        message: sweetMessage,
        onSaved: vi.fn(),
      })
    );

    await waitFor(() =>
      expect(result.current.drafts).toEqual(smartReplyDrafts)
    );
    expect(
      requests.filter((request) => request === "POST /api/ai/smart-reply")
    ).toHaveLength(1);
  });

  it("does not ask the AI while closed", () => {
    const requests = recordRequests();
    renderHookWithProviders(() =>
      useSmartReplyController({
        isOpen: false,
        message: sweetMessage,
        onSaved: vi.fn(),
      })
    );

    expect(requests).toEqual([]);
  });

  it("puts a picked idea into the draft", () => {
    const { result } = renderHookWithProviders(() =>
      useSmartReplyController({
        isOpen: true,
        message: sweetMessage,
        onSaved: vi.fn(),
      })
    );
    const [draft] = smartReplyDrafts;

    act(() => result.current.handlePickDraft(draft?.text ?? ""));

    expect(result.current.replyText).toBe(draft?.text);
  });

  it("flags a failed load so the modal can offer Try again", async () => {
    server.use(...scenarios.ai.smartReplyError);
    const { result } = renderHookWithProviders(() =>
      useSmartReplyController({
        isOpen: true,
        message: sweetMessage,
        onSaved: vi.fn(),
      })
    );

    await waitFor(() => expect(result.current.hasDraftsError).toBe(true));
    expect(result.current.drafts).toEqual([]);
  });

  it("saves a trimmed reply and notifies the caller", async () => {
    const requests = recordRequests();
    const onSaved = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useSmartReplyController({ isOpen: true, message: sweetMessage, onSaved })
    );

    act(() => result.current.setReplyText("  Thank you!  "));
    await act(() => result.current.handleSave());

    expect(requests).toContain(`POST /api/messages/${sweetMessage._id}/reply`);
    expect(onSaved).toHaveBeenCalledOnce();
  });

  it("does not save a blank draft", async () => {
    const requests = recordRequests();
    const onSaved = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useSmartReplyController({ isOpen: true, message: sweetMessage, onSaved })
    );

    act(() => result.current.setReplyText("   "));
    await act(() => result.current.handleSave());

    // Opening the modal loads the drafts, but no answer is saved.
    expect(
      requests.filter((request) => request.includes("/api/messages/"))
    ).toEqual([]);
    expect(onSaved).not.toHaveBeenCalled();
  });
});
