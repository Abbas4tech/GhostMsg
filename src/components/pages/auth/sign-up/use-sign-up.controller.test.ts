import { act, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { renderHookWithProviders } from "@/test/test-utils";
import { useSignUpController } from "./use-sign-up.controller";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const NEW_USER = {
  email: "newghost@example.com",
  password: "secret123",
  username: "newghost",
};

describe("useSignUpController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers the user and redirects to verification", async () => {
    const { result } = renderHookWithProviders(() => useSignUpController());

    await act(() => result.current.handleSubmit(NEW_USER));

    expect(toast.success).toHaveBeenCalledWith(
      "User registered successfully. Please verify your email."
    );
    expect(replace).toHaveBeenCalledWith(`/verify/${NEW_USER.username}`);
  });

  it("toasts the server error and stays on the page", async () => {
    server.use(...scenarios.signUp.error);
    const { result } = renderHookWithProviders(() => useSignUpController());

    await act(() => result.current.handleSubmit(NEW_USER));

    expect(toast.error).toHaveBeenCalledWith("Email is already registered");
    expect(replace).not.toHaveBeenCalled();
  });

  it("exposes username availability from the debounced check", async () => {
    const { result } = renderHookWithProviders(() => useSignUpController());

    act(() => result.current.form.setValue("username", NEW_USER.username));

    await waitFor(() =>
      expect(result.current.usernameAvailability).toBe("available")
    );
  });
});
