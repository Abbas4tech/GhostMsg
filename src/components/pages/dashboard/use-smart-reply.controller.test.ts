import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  answeredSpicyMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useSmartReplyController } from "./use-smart-reply.controller";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const AI_REPLY = "Thanks for the kind words. You just made my day!";

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

  it("fills the draft with the generated AI reply", async () => {
    const { result } = renderHookWithProviders(() =>
      useSmartReplyController({
        isOpen: true,
        message: sweetMessage,
        onSaved: vi.fn(),
      })
    );

    await act(() => result.current.handleGenerate("wholesome"));

    await waitFor(() => expect(result.current.replyText).toBe(AI_REPLY));
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

    expect(requests).toEqual([]);
    expect(onSaved).not.toHaveBeenCalled();
  });
});
