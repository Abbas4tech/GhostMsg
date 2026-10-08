import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

const CLICK_ME_REGEX = /click me/i;

describe("Element: Button", () => {
  it("should render button text correctly", () => {
    render(<Button>Click Me</Button>);
    expect(
      screen.getByRole("button", { name: CLICK_ME_REGEX })
    ).toBeInTheDocument();
  });

  it("should trigger onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click Me</Button>);
    const btn = screen.getByRole("button", { name: CLICK_ME_REGEX });
    await user.click(btn);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should apply variant classes correctly", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass("bg-destructive");
  });
});
