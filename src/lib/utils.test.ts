import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins conditional classes", () => {
    expect(cn("flex", false, undefined, "gap-2")).toBe("flex gap-2");
  });

  it("keeps the later of two conflicting utilities", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("treats the semantic type scale as a size, not a colour", () => {
    // A text colour must not drop the type step (and vice versa).
    expect(cn("text-h2", "text-destructive")).toBe("text-h2 text-destructive");
  });

  it("lets a type step replace raw size, weight, leading and tracking", () => {
    expect(
      cn("font-medium text-sm leading-snug tracking-wide", "text-title")
    ).toBe("text-title");
  });

  it("lets a later type step win", () => {
    expect(cn("font-display text-h3", "text-h2")).toBe("font-display text-h2");
  });
});
