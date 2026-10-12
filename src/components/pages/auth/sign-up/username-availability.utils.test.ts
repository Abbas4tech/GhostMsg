import { describe, expect, it } from "vitest";
import {
  deriveUsernameAvailability,
  isCheckableUsername,
} from "./username-availability.utils";

describe("isCheckableUsername", () => {
  it("requires at least 2 non-space characters", () => {
    expect(isCheckableUsername("a")).toBe(false);
    expect(isCheckableUsername("  a ")).toBe(false);
    expect(isCheckableUsername("ab")).toBe(true);
  });
});

describe("deriveUsernameAvailability", () => {
  it("is 'checking' while fetching, regardless of previous data", () => {
    expect(
      deriveUsernameAvailability({
        isFetching: true,
        isCheckable: true,
        data: { success: true },
      })
    ).toBe("checking");
  });

  it("is 'taken' on an error or an explicit failure for a checkable name", () => {
    expect(
      deriveUsernameAvailability({
        isFetching: false,
        isCheckable: true,
        error: new Error("taken"),
      })
    ).toBe("taken");
    expect(
      deriveUsernameAvailability({
        isFetching: false,
        isCheckable: true,
        data: { success: false },
      })
    ).toBe("taken");
  });

  it("is 'available' on success and 'idle' otherwise", () => {
    expect(
      deriveUsernameAvailability({
        isFetching: false,
        isCheckable: true,
        data: { success: true },
      })
    ).toBe("available");
    expect(
      deriveUsernameAvailability({ isFetching: false, isCheckable: false })
    ).toBe("idle");
  });
});
