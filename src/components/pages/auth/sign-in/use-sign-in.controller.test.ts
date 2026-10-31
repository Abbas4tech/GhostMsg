import { act, renderHook } from "@testing-library/react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSignInController } from "./use-sign-in.controller";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
// `notify` (the design's toast API) forwards to the mocked Sonner spies above.
vi.mock("@/components/elements/sonner", async () => {
  const sonner = await import("sonner");
  return { notify: sonner.toast };
});

const CREDENTIALS = { identifier: "johndoe", password: "secret123" };

describe("useSignInController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signs in with credentials and redirects to the dashboard", async () => {
    vi.mocked(signIn).mockResolvedValue({
      error: null,
      ok: true,
      status: 200,
      url: "/dashboard",
    });
    const { result } = renderHook(() => useSignInController());

    await act(() => result.current.handleSubmit(CREDENTIALS));

    expect(signIn).toHaveBeenCalledWith("credentials", {
      redirect: false,
      ...CREDENTIALS,
    });
    expect(toast.success).toHaveBeenCalledWith("Login successful");
    expect(replace).toHaveBeenCalledWith("/dashboard");
  });

  it("honours a custom redirect path", async () => {
    vi.mocked(signIn).mockResolvedValue({
      error: null,
      ok: true,
      status: 200,
      url: "/u/johndoe",
    });
    const { result } = renderHook(() =>
      useSignInController({ redirectPath: "/u/johndoe" })
    );

    await act(() => result.current.handleSubmit(CREDENTIALS));

    expect(replace).toHaveBeenCalledWith("/u/johndoe");
  });

  it("toasts the NextAuth error and stays on the page", async () => {
    vi.mocked(signIn).mockResolvedValue({
      error: "CredentialsSignin",
      ok: false,
      status: 401,
      url: null,
    });
    const { result } = renderHook(() => useSignInController());

    await act(() => result.current.handleSubmit(CREDENTIALS));

    expect(toast.error).toHaveBeenCalledWith("CredentialsSignin");
    expect(replace).not.toHaveBeenCalled();
  });

  it("toasts a generic message when sign-in throws", async () => {
    vi.mocked(signIn).mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useSignInController());

    await act(() => result.current.handleSubmit(CREDENTIALS));

    expect(toast.error).toHaveBeenCalledWith(
      "Login failed. Please check your credentials."
    );
  });
});
