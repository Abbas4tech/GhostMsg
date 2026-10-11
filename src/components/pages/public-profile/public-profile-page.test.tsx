import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { createTestQueryClient, renderWithProviders } from "@/test/test-utils";
import { PublicProfilePage } from "./public-profile-page";
import { useSendMessageController } from "./use-send-message.controller";

const TYPE_MESSAGE_REGEX = /type your message here/i;
const SEND_BTN_REGEX = /^send$/i;
const SUGGEST_BTN_REGEX = /suggest messages/i;
const SUGGESTION = "What is your favorite book of all time?";

describe("PublicProfilePage", () => {
  it("wires controllers into the public profile block", () => {
    renderWithProviders(
      <PublicProfilePage autoFetchSuggestions={false} username="johndoe" />
    );

    expect(
      screen.getByRole("heading", { name: "@johndoe" })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(TYPE_MESSAGE_REGEX)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: SEND_BTN_REGEX })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: SUGGEST_BTN_REGEX })
    ).toBeInTheDocument();
  });
});

describe("useSendMessageController", () => {
  it("writes a selected suggestion straight into form state", async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useSendMessageController({
          username: "johndoe",
          autoFetchSuggestions: false,
        }),
      { wrapper }
    );

    await act(async () => {
      result.current.selectSuggestion(SUGGESTION);
      await result.current.form.trigger("content");
    });

    expect(result.current.form.getValues("content")).toBe(SUGGESTION);
    expect(result.current.form.formState.errors.content).toBeUndefined();
  });
});
