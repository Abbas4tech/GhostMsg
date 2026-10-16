import { renderHook } from "@testing-library/react";
import { signIn } from "next-auth/react";
import { describe, expect, it, vi } from "vitest";
import { useGoogleSignInController } from "./use-google-sign-in.controller";

vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));

describe("useGoogleSignInController", () => {
  it("starts the Google OAuth flow with a stable callback", () => {
    const { result, rerender } = renderHook(() => useGoogleSignInController());
    const first = result.current;

    rerender();
    result.current();

    expect(result.current).toBe(first);
    expect(signIn).toHaveBeenCalledWith("google");
  });
});
