import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SentimentBadge } from "./sentiment-badge";

const SWEET_REGEX = /sweet/i;
const SPICY_REGEX = /spicy/i;

describe("Pattern: SentimentBadge", () => {
  it("should render sentiment label and icon", () => {
    render(<SentimentBadge sentiment="sweet" />);
    expect(screen.getByText(SWEET_REGEX)).toBeInTheDocument();
  });

  it("should apply sentiment variant class correctly", () => {
    render(<SentimentBadge sentiment="spicy" />);
    expect(screen.getByText(SPICY_REGEX).parentElement).toHaveClass(
      "text-amber-600"
    );
  });
});
