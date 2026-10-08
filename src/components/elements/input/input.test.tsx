import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./input";

const SEARCH_PLACEHOLDER = /enter username/i;

describe("Element: Input", () => {
  it("should render placeholder text", () => {
    render(<Input placeholder="Enter username..." />);
    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toBeInTheDocument();
  });

  it("should update value when user types", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Input onChange={handleChange} placeholder="Enter username..." />);
    const input = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);
    await user.type(input, "johndoe");

    expect(handleChange).toHaveBeenCalled();
  });
});
