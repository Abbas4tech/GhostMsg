import { act } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { renderHookWithProviders } from "@/test/test-utils";
import { useVerifyController } from "./use-verify.controller";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const USERNAME = "newghost";
const CODE = { code: "123456" };

describe("useVerifyController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies the code and redirects to sign-in", async () => {
    const { result } = renderHookWithProviders(() =>
      useVerifyController(USERNAME)
    );

    await act(() => result.current.handleSubmit(CODE));

    expect(toast.success).toHaveBeenCalledWith("Account verified successfully");
    expect(replace).toHaveBeenCalledWith("/sign-in");
  });

  it("toasts the server error for an incorrect code", async () => {
    server.use(...scenarios.verify.invalid);
    const { result } = renderHookWithProviders(() =>
      useVerifyController(USERNAME)
    );

    await act(() => result.current.handleSubmit(CODE));

    expect(toast.error).toHaveBeenCalledWith("Incorrect verification code");
    expect(replace).not.toHaveBeenCalled();
  });
});
