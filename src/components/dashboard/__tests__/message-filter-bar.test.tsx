import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MessageFilterBar } from "../message-filter-bar";

const SEARCH_MESSAGES_REGEX = /search messages/i;
const ALL_CHIP_REGEX = /all/i;
const UNREAD_CHIP_REGEX = /unread/i;
const STARRED_CHIP_REGEX = /starred/i;
const QUARANTINED_CHIP_REGEX = /quarantined/i;

describe("MessageFilterBar component", () => {
  it("should render full-width search input and filter chips", () => {
    render(
      <MessageFilterBar
        activeStatus="all"
        counts={{ all: 5, unread: 2, starred: 1, quarantined: 1, answered: 1 }}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
        searchQuery=""
      />
    );

    expect(
      screen.getByPlaceholderText(SEARCH_MESSAGES_REGEX)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ALL_CHIP_REGEX })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: UNREAD_CHIP_REGEX })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: STARRED_CHIP_REGEX })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: QUARANTINED_CHIP_REGEX })
    ).toBeInTheDocument();
  });

  it("should trigger onSearchChange when user types into search input", async () => {
    const user = userEvent.setup();
    const handleSearchChange = vi.fn();

    render(
      <MessageFilterBar
        activeStatus="all"
        onSearchChange={handleSearchChange}
        onStatusChange={vi.fn()}
        searchQuery=""
      />
    );

    const input = screen.getByPlaceholderText(SEARCH_MESSAGES_REGEX);
    await user.type(input, "hello");

    expect(handleSearchChange).toHaveBeenCalled();
  });

  it("should trigger onStatusChange when a filter chip is clicked", async () => {
    const user = userEvent.setup();
    const handleStatusChange = vi.fn();

    render(
      <MessageFilterBar
        activeStatus="all"
        onSearchChange={vi.fn()}
        onStatusChange={handleStatusChange}
        searchQuery=""
      />
    );

    const starredChip = screen.getByRole("button", {
      name: STARRED_CHIP_REGEX,
    });
    await user.click(starredChip);

    expect(handleStatusChange).toHaveBeenCalledWith("starred");
  });
});
