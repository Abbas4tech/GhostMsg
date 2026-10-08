import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Message } from "@/model/user.model";
import { renderWithProviders } from "@/test/test-utils";
import MessageCard from "../message-card";

const mockMessage: Message = {
  _id: "msg_12345",
  content: "This is a test anonymous message for Vitest component testing.",
  sentimentTag: "sweet",
  isQuarantined: false,
  isPinned: false,
  isRead: true,
  senderHash: "sender_hash_9876",
  createdAt: new Date("2026-10-08T06:00:00Z"),
};

const REPLY_BTN_REGEX = /reply/i;
const STORY_CARD_BTN_REGEX = /story card/i;

describe("MessageCard component", () => {
  it("should render message content and sentiment badge", () => {
    renderWithProviders(<MessageCard message={mockMessage} />);

    expect(screen.getByText(mockMessage.content)).toBeInTheDocument();
    expect(screen.getByText("Sweet")).toBeInTheDocument();
  });

  it("should trigger onOpenReply callback when Reply button is clicked", async () => {
    const user = userEvent.setup();
    const handleOpenReply = vi.fn();

    renderWithProviders(
      <MessageCard message={mockMessage} onOpenReply={handleOpenReply} />
    );

    const replyBtn = screen.getByRole("button", { name: REPLY_BTN_REGEX });
    await user.click(replyBtn);

    expect(handleOpenReply).toHaveBeenCalledWith(mockMessage);
  });

  it("should trigger onOpenStoryCard callback when Story Card button is clicked", async () => {
    const user = userEvent.setup();
    const handleOpenStory = vi.fn();

    renderWithProviders(
      <MessageCard message={mockMessage} onOpenStoryCard={handleOpenStory} />
    );

    const storyBtn = screen.getByRole("button", { name: STORY_CARD_BTN_REGEX });
    await user.click(storyBtn);

    expect(handleOpenStory).toHaveBeenCalledWith(mockMessage);
  });
});
