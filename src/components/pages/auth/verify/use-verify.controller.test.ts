import { act } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { renderHookWithProviders } from "@/test/test-utils";
import { useVerifyController } from "./use-verify.controller";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
// `notify` (the design's toast API) forwards to the mocked Sonner spies above.
vi.mock("@/components/elements/sonner", async () => {
  const sonner = await import("sonner");
  return { notify: sonner.toast };
});

const USERNAME = "newghost";
const CODE = { code: "123456" };

describe("useVerifyController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the verified state instead of redirecting", async () => {
    const { result } = renderHookWithProviders(() =>
      useVerifyController(USERNAME)
    );

    await act(() => result.current.handleSubmit(CODE));

    expect(result.current.isVerified).toBe(true);
    expect(result.current.codeError).toBeNull();
  });

  it("shows the tries left for a wrong code", async () => {
    server.use(...scenarios.verify.invalid);
    const { result } = renderHookWithProviders(() =>
      useVerifyController(USERNAME)
    );

    await act(() => result.current.handleSubmit(CODE));

    expect(result.current.isVerified).toBe(false);
    expect(result.current.codeError).toEqual({
      detail: "2 tries left. Check for the newest email.",
      title: "That code isn't right.",
    });
    expect(result.current.needsNewCode).toBe(false);
  });

  it("locks the code once the tries are used up", async () => {
    server.use(...scenarios.verify.locked);
    const { result } = renderHookWithProviders(() =>
      useVerifyController(USERNAME)
    );

    await act(() => result.current.handleSubmit(CODE));

    expect(result.current.codeError?.title).toBe("Too many tries.");
    expect(result.current.needsNewCode).toBe(true);
  });

  it("asks for a new code when it has expired", async () => {
    server.use(...scenarios.verify.expired);
    const { result } = renderHookWithProviders(() =>
      useVerifyController(USERNAME)
    );

    await act(() => result.current.handleSubmit(CODE));

    expect(result.current.codeError?.title).toBe("That code has expired.");
    expect(result.current.needsNewCode).toBe(true);
  });

  it("starts the resend cooldown on mount", () => {
    const { result } = renderHookWithProviders(() =>
      useVerifyController(USERNAME)
    );

    expect(result.current.resendSecondsLeft).toBe(60);
  });

  it("resends a code, unlocks the slots and restarts the cooldown", async () => {
    server.use(...scenarios.verify.locked);
    const { result } = renderHookWithProviders(() =>
      useVerifyController(USERNAME)
    );
    await act(() => result.current.handleSubmit(CODE));

    await act(() => result.current.handleResend());

    expect(toast.success).toHaveBeenCalledWith("We sent you a new code.");
    expect(result.current.needsNewCode).toBe(false);
    expect(result.current.codeError).toBeNull();
    expect(result.current.form.getValues("code")).toBe("");
    expect(result.current.resendSecondsLeft).toBe(60);
  });

  it("takes the server's wait when a resend is refused", async () => {
    server.use(...scenarios.resendCode.cooldown);
    const { result } = renderHookWithProviders(() =>
      useVerifyController(USERNAME)
    );

    await act(() => result.current.handleResend());

    expect(toast.error).toHaveBeenCalledWith(
      "You can get a new code in 42 seconds."
    );
    expect(result.current.resendSecondsLeft).toBe(42);
  });

  it("tracks form validity reactively on change", async () => {
    const { result } = renderHookWithProviders(() =>
      useVerifyController(USERNAME)
    );

    expect(result.current.form.formState.isValid).toBe(false);

    await act(async () => {
      await result.current.form.setValue("code", "123456", {
        shouldValidate: true,
      });
    });

    expect(result.current.form.formState.isValid).toBe(true);
  });
});
