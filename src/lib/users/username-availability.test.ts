import { describe, expect, it } from "vitest";
import {
  deriveUsernameAvailability,
  isCheckableUsername,
} from "./username-availability";

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
        data: { success: true },
        isCheckable: true,
        isFetching: true,
      })
    ).toBe("checking");
  });

  it("is 'taken' on an error or an explicit failure for a checkable name", () => {
    expect(
      deriveUsernameAvailability({
        error: new Error("taken"),
        isCheckable: true,
        isFetching: false,
      })
    ).toBe("taken");
    expect(
      deriveUsernameAvailability({
        data: { success: false },
        isCheckable: true,
        isFetching: false,
      })
    ).toBe("taken");
  });

  it("is 'available' on success and 'idle' otherwise", () => {
    expect(
      deriveUsernameAvailability({
        data: { success: true },
        isCheckable: true,
        isFetching: false,
      })
    ).toBe("available");
    expect(
      deriveUsernameAvailability({ isCheckable: false, isFetching: false })
    ).toBe("idle");
  });
});
