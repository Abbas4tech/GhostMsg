import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import { SendMessageForm } from "../send-message-form";

const TYPE_MESSAGE_REGEX = /type your message here/i;
const SEND_BTN_REGEX = /^send$/i;

describe("SendMessageForm component", () => {
  it("should render textarea and submit button", () => {
    renderWithProviders(<SendMessageForm username="johndoe" />);

    expect(screen.getByPlaceholderText(TYPE_MESSAGE_REGEX)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: SEND_BTN_REGEX })
    ).toBeInTheDocument();
  });

  it("should update content textarea when selectedContent prop is passed", () => {
    renderWithProviders(
      <SendMessageForm
        selectedContent="What is your favorite book of all time?"
        username="johndoe"
      />
    );

    const textarea = screen.getByPlaceholderText(
      TYPE_MESSAGE_REGEX
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("What is your favorite book of all time?");
  });

  it("should disable submit button when content is less than 10 characters", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SendMessageForm username="johndoe" />);

    const textarea = screen.getByPlaceholderText(TYPE_MESSAGE_REGEX);
    await user.type(textarea, "Short");

    const submitBtn = screen.getByRole("button", { name: SEND_BTN_REGEX });
    expect(submitBtn).toBeDisabled();
  });
});
